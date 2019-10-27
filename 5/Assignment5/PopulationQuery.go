package main

import (
	"fmt"
	"os"
	"strconv"
	"math"
	"encoding/csv"
	"sync"
)

type CensusGroup struct {
	population int
	latitude, longitude float64
}

type CensusGroupLock struct {
	mu sync.Mutex
}


type fn func(censusData []CensusGroup) (float64, float64, float64, float64, int)

func getCorners_v1(censusData []CensusGroup) (float64, float64, float64, float64, int) {
	var maxLatitude, maxLongitude, minLatitude, minLongitude float64
	var totalPopulation int
	maxLatitude = censusData[0].latitude
	minLatitude = censusData[0].latitude
	maxLongitude = censusData[0].longitude
	maxLongitude = censusData[0].longitude

	for _, val := range censusData {
		maxLatitude = math.Max(maxLatitude, val.latitude)
		minLatitude = math.Min(minLatitude, val.latitude)
		maxLongitude = math.Max(maxLongitude, val.longitude)
		minLongitude = math.Min(minLongitude, val.longitude)
		totalPopulation += val.population
	}

	return maxLongitude, minLongitude, maxLatitude, minLatitude, totalPopulation
}

func getCorners_v2(censusData []CensusGroup) (float64, float64, float64, float64, int) {
	if len(censusData) <= 10000 {
		return getCorners_v1(censusData)
	}
	mid := len(censusData) / 2
	var maxLatitude, maxLongitude, minLatitude, minLongitude float64
	var totalPopulation int
	done := make(chan bool)
	go func() {
		maxLongitude, minLongitude, maxLatitude, minLatitude, totalPopulation = getCorners_v2(censusData[:mid])
		done <- true
	} ()
	maxLongitude2, minLongitude2, maxLatitude2, minLatitude2, totalPopulation2 := getCorners_v2(censusData[mid:])
	<- done // now you have max/min from left and right tree
	return math.Max(maxLongitude, maxLongitude2), math.Min(minLongitude, minLongitude2), math.Max(maxLatitude, maxLatitude2), math.Min(minLatitude, minLatitude2), totalPopulation + totalPopulation2
}

func makeGrid_v3(censusData []CensusGroup, xdim int, ydim int, maxLongitude float64, minLongitude float64, maxLatitude float64, minLatitude float64 ) ([][]int) {
	USGrid := make([][]int, xdim)
	for i, _ := range USGrid {
		USGrid[i] = make([]int, ydim)
	}

	stepY := math.Abs(minLatitude - maxLatitude) / float64(ydim)
	stepX := math.Abs(minLongitude - maxLongitude) / float64(xdim)

	for _, val := range censusData {
		var xIndex int = int(( val.longitude - minLongitude ) / stepX)
		var yIndex int = int(( val.latitude - minLatitude ) / stepY)
		if xIndex < xdim && yIndex < ydim {
			USGrid[xIndex][yIndex] += val.population
		}
	}
	return USGrid
}


func makeGrid_v5(USGrid [][]int, locks [][]CensusGroupLock, censusData []CensusGroup, xdim int, ydim int, maxLongitude float64, minLongitude float64, maxLatitude float64, minLatitude float64, stepX float64, stepY float64 ) {
	if len(censusData) == 1 {
		var xIndex int = int(( censusData[0].longitude - minLongitude ) / stepX)
		var yIndex int = int(( censusData[0].latitude - minLatitude ) / stepY)
		if xIndex < xdim && yIndex < ydim {
			locks[xIndex][yIndex].mu.Lock()
			USGrid[xIndex][yIndex] += censusData[0].population
			locks[xIndex][yIndex].mu.Unlock()
		}
		return
	}

	mid := len(censusData) / 2
	done_make := make(chan bool)
	go func() {
		makeGrid_v5(USGrid, locks, censusData[:mid], xdim, ydim, maxLongitude, minLongitude, maxLatitude, minLatitude, stepX, stepY)
		done_make <- true
	} ()
	makeGrid_v5(USGrid, locks, censusData[mid:], xdim, ydim, maxLongitude, minLongitude, maxLatitude, minLatitude, stepX, stepY)
	<- done_make
	return
}


func makeGrid_v4(censusData []CensusGroup, xdim int, ydim int, maxLongitude float64, minLongitude float64, maxLatitude float64, minLatitude float64, stepX float64, stepY float64) ([][]int) {
	if len(censusData) <= 10000 {
		return makeGrid_v3(censusData, xdim, ydim, maxLongitude, minLongitude, maxLatitude, minLatitude)
	}

	mid := len(censusData) / 2
	var left [][]int
	done_make := make(chan bool)
	go func() {
		left = makeGrid_v4(censusData[:mid], xdim, ydim, maxLongitude, minLongitude, maxLatitude, minLatitude, stepX, stepY)
		done_make <- true
	} ()
	right := makeGrid_v4(censusData[mid:], xdim, ydim, maxLongitude, minLongitude, maxLatitude, minLatitude, stepX, stepY)
	<- done_make
	return addSeq(left, right, xdim, ydim)
	//return addGrids_v4(left, right)
}


func addSeq(first [][]int, second[][]int, xdim int, ydim int) ([][]int) {
	for x := 0; x < xdim; x++ {
		for y := 0; y < ydim; y++ {
			first[x][y] = first[x][y] + second[x][y]
		}
	}
	return first
}

func addGrids_v4(first [][]int, second [][]int) ([][]int) {
	if len(first) == 1 {
		temp := addRows(first[0], second[0])
		return [][]int{temp}
	}
	mid := len(first) / 2
	var left [][]int
	done_add := make(chan bool)
	go func() {
		left = addGrids_v4(first[:mid], second[:mid])
		done_add <- true
	} ()
	right := addGrids_v4(first[mid:], second[mid:])
	<- done_add
	// when you're done... combine the two... use append
	return append(left, right...)
}

func addRows(first []int, second[]int) ([]int) {
	if len(first) == 1 {
		return []int{first[0] + second[0]}
	}
	mid := len(first) / 2
	var left []int
	done_rows := make(chan bool)
	go func() {
		left = addRows(first[:mid], second[:mid])
		done_rows <- true
	} ()
	right := addRows(first[mid:], second[mid:])
	<- done_rows
	return append(left, right...) // wwoooooooowww. im so kewl *hair flip*
}

func updateGrid_v3(USGrid [][]int, xdim int, ydim int) ([][]int) {
	for x := 0; x < xdim; x++ {
		for y := ydim - 1; y >= 0; y-- {
			if x == 0 && y < ydim - 1 {  // left
				USGrid[x][y] = USGrid[x][y] + USGrid[x][y + 1]
			} else if y == ydim && x > 0 {  // top
				USGrid[x][y] = USGrid[x][y] + USGrid[x - 1][y]
			} else if y < ydim - 1 && x > 0 {
				USGrid[x][y] = USGrid[x][y] + USGrid[x - 1][y] + USGrid[x][y + 1] - USGrid[x - 1][y + 1]
			} 
		}
	}
	return USGrid
}

func PrefixSum_sir(data []int, output []int, parent chan int) {
	if len(data) > 1 {
		mid := len(data)/2
		left := make(chan int)
		right := make(chan int)
		go PrefixSum_sir(data[:mid], output[:mid], left) // just go left blah blah
		go PrefixSum_sir(data[mid:], output[mid:], right)
		leftSum := <-left  // the left child has computed its value and now its sending u its result 
		parent <- leftSum + <- right // the right child is also sending u its result. In turn, you're sending your parent your value
		fromLeft := <-parent // this is the value your parent is passing to you of its left child... 
		left <- fromLeft // and now you're passing it onwards to your left child...
		right <- fromLeft + leftSum // the right child will get the value of 0 - (n-4) from 'fromLeft' and n-1 , n-2 from 'leftSum'
		<-left // now you're waiting for your left and right children to complete
		<-right		
	} else if len(data) == 1 {
		parent <- data[0]
		output[0] = data[0] + <-parent
	} else {
		parent<- 0
		<-parent
	}
	parent <- 0
}


func updateRow(val []int) ([]int) {
	output := make([]int, len(val))
	parent := make(chan int)
	go PrefixSum_sir(val, output, parent)
	<-parent // now your row will be ready... SHOULDNT IT BE PARENT<-
	return output
}

func PrefixSum(data []int, output []int, myrange int) {
	for x := myrange - 1 ; x >= 0; x-- {
		if x == myrange - 1 {
			output[x] = data[x]
		} else {
			output[x] = data[x] + output[x + 1]
		}
	}
}

func PrefixSumCol(newGrid [][]int, USGrid [][]int, output [][]int, myrange int, index int) {
	for i := 0; i < myrange; i++ {
		if i == 0 {
			output[i][index] = newGrid[i][index]
		} else {
			output[i][index] = data[i][index] + output[i - 1][index]
		}
	}
}


func updateGrid_v6(USGrid [][]int, xdim int, ydim int) ([][]int) {
	newGrid := make([][]int, xdim)
	for i, _ := range newGrid {
		newGrid[i] = make([]int, ydim)
	}

	var wg sync.WaitGroup
	var wg_col sync.WaitGroup

	for i,val := range USGrid {  
		wg.Add(1) 
		go func(val []int, i int) {
			PrefixSum(val, newGrid[i], ydim) 
			defer wg.Done()
		} (val, i)
	}

	wg.Wait()
	fmt.Println(newGrid)
	newGrid2 := make([][]int, xdim)
	for i, _ := range newGrid {
		newGrid2[i] = make([]int, ydim)
	}

	for i := 0; i < ydim; i++ {  
		wg_col.Add(1) 
		go func(i int) {
			PrefixSumCol(newGrid, USGrid, newGrid2, xdim, i)
			defer wg_col.Done()
		} (i)
	}

	wg_col.Wait()
	return newGrid2
}

func makeGrid(censusData []CensusGroup, xdim int, ydim int, maxLongitude float64, minLongitude float64, maxLatitude float64, minLatitude float64, totalPopulation int) ([][]CensusGroup, int) {
	stepY := math.Abs(minLatitude - maxLatitude) / float64(ydim)
	stepX := math.Abs(minLongitude - maxLongitude) / float64(xdim)

	fmt.Println("stepX", stepX, "stepY", stepY)

	USGrid := make([][]CensusGroup, xdim + 1)
	for i, _ := range USGrid {
		USGrid[i] = make([]CensusGroup, ydim + 1)
	}
	
	for x := 0; x <= xdim; x++ {
		for y := 0; y <= ydim; y++ {
			USGrid[int(x)][int(y)] = CensusGroup{0, minLatitude, minLongitude}
			minLatitude += stepY
		}
		minLongitude += stepX
		minLatitude = minLatitude - (float64(ydim + 1)*stepY)
	}
	return USGrid, totalPopulation
}


func ansQuery_v1(USGrid [][]CensusGroup, totalPopulation int, censusData []CensusGroup, west int, south int, east int, north int, xdim int, ydim int) (int, float64) {
	var USpopulation int
	for _, val := range censusData {
		for x := 0; x < xdim; x++ {
			for y := 0; y < ydim; y++ {
				if val.latitude >= USGrid[x][y].latitude && val.latitude <= USGrid[x][y + 1].latitude && val.longitude >= USGrid[x][y].longitude && val.longitude <= USGrid[x + 1][y].longitude {
					
					if x >= west - 1 && x <= east - 1 && y >= south - 1 && y <= north - 1 {
						USpopulation += val.population
						
					}
				}
			}
		}
	}
	return USpopulation, (float64(USpopulation) / float64(totalPopulation) ) * 100
}

func ansQuery_v2(USGrid [][]CensusGroup, totalPopulation int, censusData []CensusGroup, west int, south int, east int, north int, xdim int, ydim int) (int, float64) {
	var USpopulation int
	USpopulation = getPopulation_v2(USGrid, totalPopulation, censusData, west, south, east, north, xdim, ydim)
	return USpopulation, (float64(USpopulation) / float64(totalPopulation) ) * 100
}

func getPopulation_v2(USGrid [][]CensusGroup, totalPopulation int, censusData []CensusGroup, west int, south int, east int, north int, xdim int, ydim int) (int) {
	if len(censusData) == 1 {
		var see int = 1
		for x := 0; x < xdim; x++ {
			for y := 0; y < ydim; y++ {
				if censusData[0].latitude >= USGrid[x][y].latitude && censusData[0].latitude <= USGrid[x][y + 1].latitude && censusData[0].longitude >= USGrid[x][y].longitude && censusData[0].longitude <= USGrid[x + 1][y].longitude {
					see = 0
					if x >= west - 1 && x <= east - 1 && y >= south - 1 && y <= north - 1 {
						return censusData[0].population
					} else {
						return 0
					}
				}
			}
		}
		if see == 1 {
			return 0
		}
	}
	mid := len(censusData) / 2
	var leftPop int
	done := make(chan bool)
	go func() {
		leftPop = getPopulation_v2(USGrid, totalPopulation, censusData[:mid], west, south, east, north, xdim, ydim)
		done <- true
	} ()
	rightPop := getPopulation_v2(USGrid, totalPopulation, censusData[mid:], west, south, east, north, xdim, ydim)
	<- done
	return leftPop + rightPop
}

func ansQuery_v3(USGrid [][]int, totalPopulation int, censusData []CensusGroup, west int, south int, east int, north int, xdim int, ydim int) (int, float64) {
	var USpopulation int
	var bottomRight int = USGrid[east - 1][south - 1]
	var topRight int
	if north + 1 - 1 < xdim {
		topRight = USGrid[east - 1][north + 1 - 1]
	}
	var bottomLeft int
	if west - 1 > 0 {
		bottomLeft = USGrid[west - 1 - 1][south - 1]
	}
	var topLeft int
	if west - 1 > 0 && north - 1 < xdim {
		topLeft = USGrid[west - 1 - 1][north + 1 - 1]
	}
	USpopulation = bottomRight - topRight - bottomLeft + topLeft
	return USpopulation, (float64(USpopulation) / float64(totalPopulation) ) * 100
}

func ParseCensusData(fname string) ([]CensusGroup, error) {
	file, err := os.Open(fname)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	records, err := csv.NewReader(file).ReadAll()
	if err != nil {
		return nil, err
	}
	censusData := make([]CensusGroup, 0, len(records))

	for _, rec := range records {
		if len(rec) == 7 {
			population, err1 := strconv.Atoi(rec[4])
			latitude, err2 := strconv.ParseFloat(rec[5], 64)
			longitude, err3 := strconv.ParseFloat(rec[6], 64)
			if err1 == nil && err2 == nil && err3 == nil {
				latpi := latitude * math.Pi / 180
				latitude = math.Log(math.Tan(latpi) + 1 / math.Cos(latpi))
				censusData = append(censusData, CensusGroup{population, latitude, longitude})
			}
		}
	}

	return censusData, nil
}

func main () {
	if len(os.Args) < 4 {
		fmt.Printf("Usage:\nArg 1: file name for input data\nArg 2: number of x-dim buckets\nArg 3: number of y-dim buckets\nArg 4: -v1, -v2, -v3, -v4, -v5, or -v6\n")
		return
	}
	fname, ver := os.Args[1], os.Args[4]
	xdim, err := strconv.Atoi(os.Args[2])
	if err != nil {
		fmt.Println(err)
		return
	}
	ydim, err := strconv.Atoi(os.Args[3])
	if err != nil {
		fmt.Println(err)
		return
	}
	censusData, err := ParseCensusData(fname)
	if err != nil {
		fmt.Println(err)
		return
	}

	USGrid := make([][]CensusGroup, xdim)
	for i, _ := range USGrid {
		USGrid[i] = make([]CensusGroup, ydim)
	}

	USGrid_v3 := make([][]int, xdim)
	for i, _ := range USGrid_v3 {
		USGrid_v3[i] = make([]int, ydim)
	}

	var totalPopulation int
	var maxLongitude, minLongitude, maxLatitude, minLatitude float64
	// Some parts may need no setup code
	switch ver {
	case "-v1":
		// YOUR SETUP CODE FOR PART 1
		maxLongitude, minLongitude, maxLatitude, minLatitude, totalPopulation = getCorners_v1(censusData)
		USGrid, totalPopulation = makeGrid(censusData, xdim, ydim, maxLongitude, minLongitude, maxLatitude, minLatitude, totalPopulation)
		//fmt.Println(USGrid)
	case "-v2":
		// YOUR SETUP CODE FOR PART 2
		maxLongitude, minLongitude, maxLatitude, minLatitude, totalPopulation = getCorners_v2(censusData)
		USGrid, totalPopulation = makeGrid(censusData, xdim, ydim, maxLongitude, minLongitude, maxLatitude, minLatitude, totalPopulation)
		fmt.Println(USGrid)
	case "-v3":
		// YOUR SETUP CODE FOR PART 3
		maxLongitude, minLongitude, maxLatitude, minLatitude, totalPopulation = getCorners_v2(censusData)
		USGrid_v3 = makeGrid_v3(censusData, xdim, ydim, maxLongitude, minLongitude, maxLatitude, minLatitude)
		USGrid_v3 = updateGrid_v3(USGrid_v3, xdim, ydim)
		fmt.Println(USGrid_v3) 
	case "-v4":
		// YOUR SETUP CODE FOR PART 4
		maxLongitude, minLongitude, maxLatitude, minLatitude, totalPopulation = getCorners_v2(censusData)
		stepY := math.Abs(minLatitude - maxLatitude) / float64(ydim)
		stepX := math.Abs(minLongitude - maxLongitude) / float64(xdim)
		USGrid_v3 = makeGrid_v4(censusData, xdim, ydim, maxLongitude, minLongitude, maxLatitude, minLatitude, stepX, stepY)
		fmt.Println("Grid made")
		fmt.Println(USGrid_v3)
		USGrid_v3 = updateGrid_v3(USGrid_v3, xdim, ydim)
		fmt.Println(USGrid_v3)
	case "-v5":
		// YOUR SETUP CODE FOR PART 5
		locks := make([][]CensusGroupLock, xdim)
		for i,_ := range locks {
			locks[i] = make([]CensusGroupLock, ydim)
		}
		maxLongitude, minLongitude, maxLatitude, minLatitude, totalPopulation = getCorners_v2(censusData)
		stepY := math.Abs(minLatitude - maxLatitude) / float64(ydim)
		stepX := math.Abs(minLongitude - maxLongitude) / float64(xdim)
		makeGrid_v5(USGrid_v3, locks, censusData, xdim, ydim, maxLongitude, minLongitude, maxLatitude, minLatitude, stepX, stepY)
		USGrid_v3 = updateGrid_v3(USGrid_v3, xdim, ydim)
		fmt.Println(USGrid_v3)
	case "-v6":
		// YOUR SETUP CODE FOR PART 6
		maxLongitude, minLongitude, maxLatitude, minLatitude, totalPopulation = getCorners_v2(censusData)
		stepY := math.Abs(minLatitude - maxLatitude) / float64(ydim)
		stepX := math.Abs(minLongitude - maxLongitude) / float64(xdim)
		USGrid_v3 = makeGrid_v4(censusData, xdim, ydim, maxLongitude, minLongitude, maxLatitude, minLatitude, stepX, stepY)
		fmt.Println(USGrid_v3)
		USGrid_v3 = updateGrid_v6(USGrid_v3, xdim, ydim)
		fmt.Println(USGrid_v3)
	default:
		fmt.Println("Invalid version argument")
		return
	}

	for {
		var west, south, east, north int
		n, err := fmt.Scanln(&west, &south, &east, &north)
		if n != 4 || err != nil || west<1 || west>xdim || south<1 || south>ydim || east<west || east>xdim || north<south || north>ydim {
			break
		}

		var population int
		var percentage float64
		switch ver {
		case "-v1":
			// YOUR QUERY CODE FOR PART 1
			population, percentage = ansQuery_v1(USGrid, totalPopulation, censusData, west, south, east, north, xdim, ydim)
		case "-v2":
			// YOUR QUERY CODE FOR PART 2
			population, percentage = ansQuery_v2(USGrid, totalPopulation, censusData, west, south, east, north, xdim, ydim)
		case "-v3":
			// YOUR QUERY CODE FOR PART 3
			population, percentage = ansQuery_v3(USGrid_v3, totalPopulation, censusData, west, south, east, north, xdim, ydim)
		case "-v4":
			// YOUR QUERY CODE FOR PART 4
			population, percentage = ansQuery_v3(USGrid_v3, totalPopulation, censusData, west, south, east, north, xdim, ydim)
		case "-v5":
			// YOUR QUERY CODE FOR PART 5
			population, percentage = ansQuery_v3(USGrid_v3, totalPopulation, censusData, west, south, east, north, xdim, ydim)
		case "-v6":
			// YOUR QUERY CODE FOR PART 6
			population, percentage = ansQuery_v3(USGrid_v3, totalPopulation, censusData, west, south, east, north, xdim, ydim)
		}

		fmt.Printf("%v %.2f%%\n", population, percentage)
	}
}
