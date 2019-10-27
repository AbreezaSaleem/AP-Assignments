-- CS300-SP17 Assignment 2: Barnes Hut Simulation
-- Deadline: 24 Feb 9pm
-- Submission: via LMS only
--
import System.Environment
import Data.List
import Graphics.Rendering.OpenGL hiding (($=))
import Graphics.UI.GLUT
import Control.Applicative
import Data.IORef
import Debug.Trace
import Data.Function (on)
--
-- PART 1: You are given many input files in the inputs directory and given 
-- code can read and parse the input files. You need to run "cabal update 
-- && cabal install glut" on your system to work on this assignment. Then
-- run "./ghc BH.hs && ./BH 1 < inputs/planets.txt" to run 1 iteration of
-- the algorithm and print updated positions. Replace 1 with any number to
-- run more iteration. You may also run it without an argument and it will
-- display the simulation using OpenGL in a window.
--
-- In the first part, you are to write the updateBody function to correctly 
-- update body after 1 unit of time has passed. You have to correctly 
-- update the position of a body by calculating the effect of all other
-- bodies on it. The placeholder implementation just moves the body left
-- without doing any physics. Read http://www.cs.princeton.edu/courses/
-- archive/fall03/cs126/assignments/nbody.html for help with physics. Try
-- simplyfying equations on paper before implementing them. You can compare
-- answers with the given binary solution.
--
-- Make helper functions as needed

type Vec2 = (Double, Double)
data Body = Body Vec2 Vec2 Double (Color3 Double)

findDistance :: Vec2 -> Vec2 -> Double
findDistance (x, y) (a, b) = sqrt( (x - a)^2 + (y - b)^2 )

updateBody :: (Foldable f) => f Body -> Body -> Body
updateBody otherBodies (Body (px, py) (vx, vy) mymass clr) = 
    let ax = foldr (\(Body (posx,posy) _ mass _ ) summed -> summed + ( ((posx-px) * 6.67e-11 * mass) / (1+(findDistance (posx, posy) (px, py))^3) ) ) 0 otherBodies
        ay = foldr (\(Body (posx,posy) _ mass _ ) summed -> summed + ( ((posy-py) * 6.67e-11 * mass) / (1+(findDistance (posx, posy) (px, py))^3) ) ) 0 otherBodies
    in  (Body (ax + px + vx , ay + py + vy ) (vx + ax, vy + ay) mymass clr)


-- PART 2: We will make a Quadtree to represent our universe. See 
-- http://www.cs.princeton.edu/courses/archive/fall03/cs126/assignments/
-- barnes-hut.html for help on this tree. The QT structure has the the
-- length of one side of quadrant) for internal nodes. The makeQT function
-- has arguments: center, length of quadrant side, a function to find
-- coordinates of an element of the tree (e.g. extract position from a Body
-- object), a function to summarize a list of nodes (e.g. to calculate a
-- Body with position center of gravity and total mass), and the list of
-- nodes to put in tree.
--
-- Note that inserting all nodes at once is much easier than inserting one
-- by one. Think of creating the root node (given all nodes), and then
-- divide the nodes into quadrants and let recursive calls create the
-- appropriate trees. In this part you do not have to give a correct 
-- implementation of the summary function
--
-- Now make QT member of Foldable typeclass. See what function you are
-- required to implement. Once this is done, change the tick function below 
-- to create the tree and then pass it to updateBody function instead of a 
-- list of bodies. No change to updateBody function should be needed since
-- it works with any Foldable.
data QT a = Internal Double a (QT a,QT a,QT a,QT a) | Leaf a | Nil
    deriving Show

instance Foldable QT where
    foldr _ val Nil = val
    foldr fn val (Leaf a) = fn a val 
    foldr fn val (Internal _ a (one, two, three, four)) = foldr fn (  foldr fn (  foldr fn (  foldr fn val four  ) three  ) two  ) one

summarize :: [Body] -> Body
summarize bdy = let (xm, ym, totalMass) = foldr (\(Body (px, py) _ mass _) (s1, s2, s3) -> ( s1 + px*mass, s2 + py*mass, s3 + mass ) ) (0, 0, 0) bdy
                in (Body (xm / totalMass, ym / totalMass ) (0, 0) totalMass (Color3 255 0 255)  )

getPos :: Body -> Vec2
getPos (Body (x, y) _ _ _) = (x, y)


filterfun :: a -> (Double, Double) -> (Double, Double) -> (a -> Vec2) -> Bool
filterfun bdy (x, y) (a, b) fn = let (px, py) = fn bdy
                           in px <= x && px >= a && py <= y && py >= b

divideNodes :: (a->Vec2) -> (Double, Double) -> (Double, Double) -> [a] -> [a]
divideNodes getPos coord1 coord2 nodes = filter (\oneNode -> filterfun oneNode coord1 coord2 getPos) nodes  


makeQT :: Vec2 -> Double -> (a->Vec2) -> ([a]->a) -> [a] -> (QT a)
makeQT _ _ _ _ [] = Nil
makeQT _ _ _ _ [x] = Leaf x 
makeQT (x, y) lengthQuad getPos summarize nodes =  ------see if a tuple is in a range???? :((((
    let  
        one = divideNodes getPos (x, y) (x - lengthQuad, y - lengthQuad) nodes
        two = divideNodes getPos (x, y + lengthQuad) (x - lengthQuad, y) nodes
        three = divideNodes getPos (x + lengthQuad, y + lengthQuad) (x, y) nodes
        four = divideNodes getPos (x + lengthQuad, y) (x, y - lengthQuad) nodes
    in Internal lengthQuad (summarize nodes) 
        ( makeQT (x - lengthQuad/2, y - lengthQuad/2) (lengthQuad/2) getPos summarize one,
          makeQT (x - lengthQuad/2, y + lengthQuad/2) (lengthQuad/2) getPos summarize two,
          makeQT (x + lengthQuad/2, y + lengthQuad/2) (lengthQuad/2) getPos summarize three,
          makeQT (x + lengthQuad/2, y - lengthQuad/2) (lengthQuad/2) getPos summarize four )


-- This functions takes a set of bodies and returns an updated set of 
-- bodies after 1 unit of time has passed (dt=1)

tickTree :: QT Body -> [Body] -> [Body]
tickTree _ [] = []
tickTree myTree (b:bodies) = updateBody myTree b:tickTree myTree bodies

--RENAME TO TICK TO CALL IT WITH QT 
tick2 ::Double -> [Body] -> [Body]
tick2 radius bodies = let mytree = makeQT (0.0, 0.0) radius getPos summarize bodies
                      in trace (show mytree)
                    tickTree (makeQT (0.0, 0.0) radius getPos summarize bodies) bodies

-- PART 3: Now we create another datatype that contains a quadtree and a 
-- function which given radius and a summarized body (containing center of
-- gravity and total mass) returns true if the summarized body is a good
-- enough approximation. Use 0.5 as threshold.
--
-- Make a correct summarize function to pass to makeQT above and then make
-- BH an instance of Foldable typeclass as well. However this instance
-- should use the internal node if the predicate function returns true and
-- recurse only if it returns false. Make sure to recurse over a BH type
-- variable. If your implementation is correct, you will be as fast as the
-- provided binary BH2 on large inputs like galaxy1.txt

app :: Body -> Double -> Body -> Bool --if it is < 0.5 then it is far away. app is a partially applied function!
app (Body (posx,posy) _ _ _ ) radius (Body (posx1,posy1) _ _ _ )  = (radius / findDistance (posx, posy) (posx1, posy1)) < 0.5

data BH a = BH (Double -> a -> Bool) (QT a)

instance Foldable BH where
    foldr _ val (BH _ Nil) = val
    foldr fn val (BH app (Leaf a)) = fn a val
    foldr fn val (BH app (Internal radius a (one, two, three, four) ) ) 
        | app radius a = fn a val
        | otherwise = foldr fn (  foldr fn (  foldr fn (  foldr fn val (BH app four)  ) (BH app three)  ) (BH app two)  ) (BH app one)


tickTree2 :: QT Body -> [Body] -> [Body]
tickTree2 _ [] = []
tickTree2 myTree (b:bodies) = updateBody (BH (app b) myTree) b:tickTree2 myTree bodies


--RENAME TO TICK TO CALL IT WITH BH 
tick ::Double -> [Body] -> [Body]
tick radius bodies = let mytree = makeQT (0.0, 0.0) radius getPos summarize bodies
                      in trace (show mytree)
                    tickTree2 (makeQT (0.0, 0.0) radius getPos summarize bodies) bodies

--RENAME IT TO TICK TO CALL IT WITH LIST 
tick1 ::Double -> [Body] -> [Body]
tick1 radius bodies = fmap (updateBody bodies) bodies


---------------------------------------------------------------------------
-- You don't need to study the code below to work on the assignment
---------------------------------------------------------------------------
main :: IO ()
main = do
    (_,args) <- getArgsAndInitialize
    stdin <- getContents
    uncurry (mainChoice args) (parseInput stdin)

mainChoice :: [String] -> Double -> [Body] -> IO ()
mainChoice (iter:_) r bodies = putStr $ applyNtimes r bodies (read iter)
mainChoice [] r bodies = do
    createWindow "Barnes Hut"
    windowSize $= Size 700 700
    bodiesRef <- newIORef bodies
    ortho2D (-r) r (-r) r
    displayCallback $= (display r bodiesRef)
    addTimerCallback 10 (timer r bodiesRef)
    mainLoop

applyNtimes :: Double -> [Body] -> Int -> String
applyNtimes r bodies n = (unlines.map show) (iterate (tick r) bodies !! n)

parseInput :: String -> (Double, [Body])
parseInput input = 
    let (cnt:r:bodies) = lines input
    in (read r, map read (take (read cnt) bodies))

dispBody :: Body -> IO ()
dispBody (Body (x,y) _ _ rgb) = color rgb >> vertex (Vertex2 x y)

display :: Double -> IORef [Body] -> IO ()
display r bodiesRef = do
    clear [ColorBuffer]
    bodies <- get bodiesRef
    renderPrimitive Points (mapM_ dispBody bodies)
    flush

timer :: Double -> IORef [Body] -> IO ()
timer r bodiesRef = do
    postRedisplay Nothing
    bodies <- get bodiesRef
    bodiesRef $= tick r bodies 
    addTimerCallback 10 (timer r bodiesRef)

instance Read Body where
    readsPrec _ input = 
        let (x:y:vx:vy:m:r:g:b:rest) = words input
        in (\str -> [(Body (read x,read y) (read vx,read vy) (read m) 
            (Color3 ((read r)/255) ((read g)/255) ((read b)/255)), 
            unwords rest)]) input

instance Show Body where
    show (Body (x,y) (vx,vy) _ _) =
        "x=" ++ show x ++ " y=" ++ show y ++ " vx=" ++ 
            show vx ++ " vy=" ++ show vy

