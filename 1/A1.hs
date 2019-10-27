-- CS300-SP17 Assignment 1: Sudoku Solver
-- Deadline: 13 Feb 9am (NOT pm)
-- Submission: via LMS only 
--
-- See Sudoku rules from https://en.wikipedia.org/wiki/Sudoku
-- The example below is also taken from that page.  
--
-- This assignment is a modification of the Haskell exam last semester
-- except that the instructions are slightly less detailed since this is
-- an assignment.  Working on this assignment is great for exam 
-- preparation if you work independently like you would have to do in exam.
--
-- You may use the following functions if needed.  Additionally any 
-- functions not needing an import are okay.  For any other functions
-- requiring an import, you must ask before using.
import Data.List ((\\), sort) -- groupBy
import Data.List
-- import Data.Function (on)
-- import Data.Trace -- ONLY USE IF STUCK AND REMOVE BEFORE SUBMISSION
--
-- Let our board be represented by a list of list of integers i.e. [[Int]]. 
-- Here 0 is used to encode an empty square in a Sudoku board.  We define a
-- type synonym Board for ease of reading.

type Board = [[Int]]

inputBoard :: Board
inputBoard = 
    [[5,3,0, 0,7,0, 0,0,0],
     [6,0,0, 1,9,5, 0,0,0],
     [0,9,8, 0,0,0, 0,6,0],
     [8,0,0, 0,6,0, 0,0,3],
     [4,0,0, 8,0,3, 0,0,1],
     [7,0,0, 0,2,0, 0,0,6],
     [0,6,0, 0,0,0, 2,8,0],
     [0,0,0, 4,1,9, 0,0,5],
     [0,0,0, 0,8,0, 0,7,9]]

inputBoard2 :: Board
inputBoard2 = 
    [[2,6,0, 8,0,0, 0,0,0],
     [0,0,3, 0,0,6, 0,2,0],
     [0,0,7, 1,0,0, 0,0,6],
     [1,4,0, 0,0,0, 3,0,0],
     [0,0,0, 4,1,5, 6,0,0],
     [0,0,2, 0,0,0, 4,7,1],
     [7,0,0, 0,0,9, 8,0,0],
     [0,8,0, 0,0,1, 2,0,7],
     [0,2,0, 0,8,7, 0,6,3]]

inputBoard3 :: Board
inputBoard3 = 
    [[0,0,0, 2,6,0, 7,0,1],
     [6,8,0, 0,7,0, 0,9,0],
     [1,9,0, 0,0,4, 5,0,0],
     [8,2,0, 1,0,0, 0,4,0],
     [0,0,4, 6,0,2, 9,0,0],
     [0,5,0, 0,0,3, 0,2,8],
     [0,0,9, 3,0,0, 0,7,4],
     [0,4,0, 0,5,0, 0,3,6],
     [7,0,3, 0,1,8, 0,0,0]]

inputBoard4 :: Board
inputBoard4 = 
   [[1,0,0, 4,8,9, 0,0,6],
     [7,3,0, 0,0,0, 0,4,0],
     [0,0,0, 0,0,1, 2,9,5],
     [0,0,7, 1,2,0, 6,0,0],
     [5,0,0, 7,0,3, 0,0,8],
     [0,0,6, 0,9,5, 7,0,0],
     [9,1,4, 6,0,0, 0,0,0],
     [0,2,0, 0,0,0, 0,3,7],
     [8,0,0, 5,1,2, 0,0,4]]

inputBoard5 :: Board
inputBoard5 =
    [[0,2,0, 6,0,8, 0,0,0],
     [5,8,0, 0,0,9, 7,0,0],
     [0,0,0, 0,4,0, 0,0,0],
     [3,7,0, 0,0,0, 5,0,0],
     [6,0,0, 0,0,0, 0,0,4],
     [0,0,8, 0,0,0, 0,1,3],
     [0,0,0, 0,2,0, 0,0,0],
     [0,0,9, 8,0,0, 0,3,6],
     [0,0,0, 3,0,6, 0,9,0]]

solvedBoard5 :: Board
solvedBoard5 = 
    [[1,2,3, 6,7,8, 9,4,5],
     [5,8,4, 2,3,9, 7,6,1],
     [9,6,7, 1,4,5, 3,2,8],
     [3,7,2, 4,6,1, 5,8,9],
     [6,9,1, 5,8,3, 2,7,4],
     [4,5,8, 7,9,2, 6,1,3],
     [8,3,6, 9,2,4, 1,5,7],
     [2,1,9, 8,5,7, 4,3,6],
     [7,4,5, 3,1,6, 8,9,2]]

solvedBoard4 :: Board
solvedBoard4 = 
    [[1,5,2, 4,8,9, 3,7,6],
     [7,3,9, 2,5,6, 8,4,1],
     [4,6,8, 3,7,1, 2,9,5],
     [3,8,7, 1,2,4, 6,5,9],
     [5,9,1, 7,6,3, 4,2,8],
     [2,4,6, 8,9,5, 7,1,3],
     [9,1,4, 6,3,7, 5,8,2],
     [6,2,5, 9,4,8, 1,3,7],
     [8,7,3, 5,1,2, 9,6,4]]

solvedBoard3 :: Board
solvedBoard3 = 
    [[4,3,5, 2,6,9, 7,8,1],
     [6,8,2, 5,7,1, 4,9,3],
     [1,9,7, 8,3,4, 5,6,2],
     [8,2,6, 1,9,5, 3,4,7],
     [3,7,4, 6,8,2, 9,1,5],
     [9,5,1, 7,4,3, 6,2,8],
     [5,1,9, 3,2,6, 8,7,4],
     [2,4,8, 9,5,7, 1,3,6],
     [7,6,3, 4,1,8, 2,5,9]]

solvedBoard2 :: Board
solvedBoard2 = 
    [[2,6,5, 8,9,3, 7,1,4],
     [4,1,3, 7,5,6, 9,2,8],
     [8,9,7, 1,2,4, 5,3,6],
     [1,4,8, 6,7,2, 3,5,9],
     [3,7,9, 4,1,5, 6,8,2],
     [6,5,2, 9,3,8, 4,7,1],
     [7,3,1, 2,6,9, 8,4,5],
     [5,8,6, 3,4,1, 2,9,7],
     [9,2,4, 5,8,7, 1,6,3]]

solvedBoard :: Board
solvedBoard = 
    [[5,3,4, 6,7,8, 9,1,2],
     [6,7,2, 1,9,5, 3,4,8],
     [1,9,8, 3,4,2, 5,6,7],
     [8,5,9, 7,6,1, 4,2,3],
     [4,2,6, 8,5,3, 7,9,1],
     [7,1,3, 9,2,4, 8,5,6],
     [9,6,1, 5,3,7, 2,8,4],
     [2,8,7, 4,1,9, 6,3,5],
     [3,4,5, 2,8,6, 1,7,9]]

-- We decide that it would be easier to work with a different board 
-- representation internally.  This representation is a list of tuples 
-- where the second member is the value and the first member is the 
-- (row,col) tuple for the coordinates.  Here are type synonyms for ease 
-- of use and the above boards in this alternate format.

type Coords = (Int,Int)
type BoardElement = (Coords,Int)

solvedBoardElements2 :: [BoardElement]
solvedBoardElements2 = 
    [((0,0),2),((0,1),6),((0,2),5),((0,3),8),((0,4),9),((0,5),3),((0,6),7),
     ((0,7),1),((0,8),4),((1,0),4),((1,1),1),((1,2),3),((1,3),7),((1,4),5),
     ((1,5),6),((1,6),9),((1,7),2),((1,8),8),((2,0),8),((2,1),9),((2,2),7),
     ((2,3),1),((2,4),2),((2,5),4),((2,6),5),((2,7),3),((2,8),6),((3,0),1),
     ((3,1),4),((3,2),8),((3,3),6),((3,4),7),((3,5),2),((3,6),3),((3,7),5),
     ((3,8),9),((4,0),3),((4,1),7),((4,2),9),((4,3),4),((4,4),1),((4,5),5),
     ((4,6),6),((4,7),8),((4,8),2),((5,0),6),((5,1),5),((5,2),2),((5,3),9),
     ((5,4),3),((5,5),8),((5,6),4),((5,7),7),((5,8),1),((6,0),7),((6,1),3),
     ((6,2),1),((6,3),2),((6,4),6),((6,5),9),((6,6),8),((6,7),4),((6,8),5),
     ((7,0),5),((7,1),8),((7,2),6),((7,3),3),((7,4),4),((7,5),1),((7,6),2),
     ((7,7),9),((7,8),7),((8,0),9),((8,1),2),((8,2),4),((8,3),5),((8,4),8),
     ((8,5),7),((8,6),1),((8,7),6),((8,8),3)]

inputBoardElements :: [BoardElement]
inputBoardElements = 
    [((0,0),5),((0,1),3),((0,4),7),((1,0),6),((1,3),1),((1,4),9),((1,5),5),
     ((2,1),9),((2,2),8),((2,7),6),((3,0),8),((3,4),6),((3,8),3),((4,0),4),
     ((4,3),8),((4,5),3),((4,8),1),((5,0),7),((5,4),2),((5,8),6),((6,1),6),
     ((6,6),2),((6,7),8),((7,3),4),((7,4),1),((7,5),9),((7,8),5),((8,4),8),
     ((8,7),7),((8,8),9)]

inputBoardEmpty :: [Coords]
inputBoardEmpty = 
    [(0,2),(0,3),(0,5),(0,6),(0,7),(0,8),(1,1),(1,2),(1,6),(1,7),(1,8),
     (2,0),(2,3),(2,4),(2,5),(2,6),(2,8),(3,1),(3,2),(3,3),(3,5),(3,6),
     (3,7),(4,1),(4,2),(4,4),(4,6),(4,7),(5,1),(5,2),(5,3),(5,5),(5,6),
     (5,7),(6,0),(6,2),(6,3),(6,4),(6,5),(6,8),(7,0),(7,1),(7,2),(7,6),
     (7,7),(8,0),(8,1),(8,2),(8,3),(8,5),(8,6)]

solvedBoardElements :: [BoardElement]
solvedBoardElements = 
    [((0,0),5),((0,1),3),((0,2),4),((0,3),6),((0,4),7),((0,5),8),((0,6),9),
     ((0,7),1),((0,8),2),((1,0),6),((1,1),7),((1,2),2),((1,3),1),((1,4),9),
     ((1,5),5),((1,6),3),((1,7),4),((1,8),8),((2,0),1),((2,1),9),((2,2),8),
     ((2,3),3),((2,4),4),((2,5),2),((2,6),5),((2,7),6),((2,8),7),((3,0),8),
     ((3,1),5),((3,2),9),((3,3),7),((3,4),6),((3,5),1),((3,6),4),((3,7),2),
     ((3,8),3),((4,0),4),((4,1),2),((4,2),6),((4,3),8),((4,4),5),((4,5),3),
     ((4,6),7),((4,7),9),((4,8),1),((5,0),7),((5,1),1),((5,2),3),((5,3),9),
     ((5,4),2),((5,5),4),((5,6),8),((5,7),5),((5,8),6),((6,0),9),((6,1),6),
     ((6,2),1),((6,3),5),((6,4),3),((6,5),7),((6,6),2),((6,7),8),((6,8),4),
     ((7,0),2),((7,1),8),((7,2),7),((7,3),4),((7,4),1),((7,5),9),((7,6),6),
     ((7,7),3),((7,8),5),((8,0),3),((8,1),4),((8,2),5),((8,3),2),((8,4),8),
     ((8,5),6),((8,6),1),((8,7),7),((8,8),9)]

-- INSTRUCTIONS: 
--   DO NOT LEAVE YOUR SOLUTION ON A SHARED LAB COMPUTER.
--   You must do parts in order below.  The following stub functions will 
--   let you work on the top-level function first.  Once you start 
--   implementing a function, comment out the stub function.  Run "main" 
--   in ghci and if it returns "True", you are doing fine so far.  You are
--   allowed to make helper functions but if you think using higher-order 
--   functions and lambdas, you won't need any.  If making helper 
--   functions, try to avoid thinking bottom-up.
main :: IO ()
main = print (sudoku inputBoard5 == solvedBoard5)
-- Part 1: Implement the sudoku solver that takes a board and returns a
-- solved board.  Assume that a solution always exists.  Use toElements, 
-- fromElements, and sudokuElements functions described below.

sudoku :: Board -> Board
sudoku b =
        let (filledCell, emptyCell) = toElements b                    
        in 
            let resultingBoard = sudokuElements [filledCell] emptyCell
            in fromElements (head resultingBoard)

-- Part 2: Lets now implement sudoku solver in element list format.  Use 
-- the functions validVals described below.  You get a list 
-- of boards in board element format.  
-- You have to return a list of all possible completely filled boards. 
-- Solve recursively.  For just one empty location, find valid values on
-- each board at that location, and pass all resulting boards to the 
-- recursive call to fill the remaining empty locations.  You can use 
-- nested map and concat or you may learn to use list comprehension.

sudokuElements :: [[BoardElement]] -> [Coords] -> [[BoardElement]]
sudokuElements bes emp | emp == [] = [head bes]
sudokuElements [] _ = []
sudokuElements bes (e:empty) = sudokuElements ( concat [ updateBoard oneBoard ( validVals oneBoard e ) e  | oneBoard <- bes ] ) empty

updateBoard :: [BoardElement] -> [Int] -> Coords -> [[BoardElement]]
updateBoard _ [] _ = []
updateBoard a (b:bs) c = let newBoard = ((c),b):a
                         in newBoard:updateBoard a bs c


-- Part 3: Write the function to find all valid values for a given 
-- coordinate.  Remember that any value not occurring in the same column 
-- or row or block is valid.  Use map and filter or list comprehension to
-- find used values and \\ to find the ones still available.  Think about
-- using integer division to find the block.

validVals :: [BoardElement] -> Coords -> [Int]
validVals [] _ = []
validVals b (r, c) = let 
                        filteredBoard = filter (\((x,y), z) -> x == r || y == c) b
                        requiredBlock = filter ( \ ((x,y), z) ->  (x == (r `div` 3)*3+0 || x == (r `div` 3)*3+1 || x == (r `div` 3)*3+2) && (y == (c `div` 3)*3+0 || y == (c `div` 3)*3+1 || y == (c `div` 3)*3+2 )     ) b 
                     in  
                        let used = map (\((x,y), z) -> z) (requiredBlock ++ filteredBoard)
                        in ([1..9] \\ used)

-- Part 4: Now lets convert the board into element format and find the 
-- list of empty locations. You may find the zip function helpful in 
-- adding coordinates.  Remember that elements with 0 value do not appear 
-- in the element format.


--DO U NEED TO IMPORT DATA.LIST?????????????????????????????-------------------------------------
  
convertOneList :: [Int] -> Int -> ([BoardElement],[Coords])
convertOneList [] _ = ([], [])
convertOneList (x:xs) row 
    | x /= 0 = let column = 8 - length xs
               in ( ((row, column), x):a, b) 
    | otherwise = let column = 8 - length xs
                  in ( a, (row, column):b) 
    where (a, b) = convertOneList xs row

toElements :: Board -> ([BoardElement],[Coords])
toElements [] = ([], [])
toElements (l:ls) = let row = 8 - length ls
                    in
                        let (be, co) = convertOneList l row
                        in (be++a, co++b) where (a, b) = toElements ls


-- Part 5: Lets convert in the other direction.  You may find sort, 
-- groupBy, and "on" functions helpful
sortedGroupedBoard :: [[BoardElement]] -> Board
sortedGroupedBoard [] = []
sortedGroupedBoard (b:bes) = map (\ ((x,y), val) -> val) b : sortedGroupedBoard bes

fromElements :: [BoardElement] -> Board
fromElements bes = let sortedBoard = groupBy (\ ((x, y), v1) ((a, b), v2) -> x==a ) ( sort bes )
                   in sortedGroupedBoard sortedBoard

