 package main 
import "fmt"

func SeqMerge(left, right[] int) [] int {
	merged := make([]int, 0, len(left) + len(right))
	for len(left) > 0 || len(right) > 0 {
		if len(left) == 0 {
			return append(merged, right...)
		} else if len(right) == 0 {
			return append(merged, left...)
		} else if left[0] <= right[0] {
			merged = append(merged, left[0])
			left = left[1:]
		} else {
			merged = append(merged, right[0])
			right = right[1:]
		}
	}
	return merged
}

func PartitionSorted(data []int, pivot int) int {
	if len(data) == 0 {
		return 0
	} else if len(data) == 1 {
		if data[0] < pivot {
			return 1
		} else {
			return 0
		}
 	}
 	mid := len(data) / 2
 	if data[mid] < pivot {
 		return mid + PartitionSorted(data[mid:], pivot)
 	} else {
 		return PartitionSorted(data[:mid], pivot)
 	}
}

func Merge(left, right, merged []int) {
	larger, smaller := left, right
	if len(left) < len(right) {
		larger, smaller = right, left
	}
	if len(larger) > 1 {
		mid := len(larger) / 2
		divRight := PartitionSorted(smaller, larger[mid])
		fmt.Printf("Larger: %v smaller: %v Going to divide right from %d against %d with pivot %d \n", larger, smaller, smaller[:divRight], larger[:mid], larger[mid])
		done := make(chan bool)
		go func() {
			Merge(larger[:mid], smaller[:divRight], merged)
			done <- true
		} ()
		Merge(larger[mid:], smaller[divRight:], merged[mid + divRight:]) // merge right side of larger array with... 
		<- done
	} else if len(larger) == 1 {
		if len(smaller) == 0 {
			merged[0] = larger[0]
		} else if larger[0] < smaller[0] {
			merged[0], merged[1] = larger[0], smaller[0]
		} else {
			merged[0], merged[1] = smaller[0], larger[0]
		}
	}
}

func MergeSort(data []int) []int {
	if len(data) <= 1 {
		return data
	}
	mid := len(data) / 2
	var left []int
	done := make(chan bool)
	go func() {
		left = MergeSort(data[:mid])
		done <- true
	}()
	right := MergeSort(data[mid:])
	<- done
	merged := make([]int, len(left) + len(right))
	Merge(left, right, merged)
	return merged
}

func main() {
	data := []int{9, 4, 3, 6, 1, 2, 10, 5, 7, 8}
	fmt.Printf("%v\n%v\n", data, MergeSort(data))
}

































