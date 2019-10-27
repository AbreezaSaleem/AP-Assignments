package main
import "fmt"

func PrefixSum(data, output []int, parent chan int) {
	if len(data) > 1 {
		mid := len(data)/2
		left := make(chan int)
		right := make(chan int)
		go PrefixSum(data[:mid], output[:mid], left) // just go left blah blah
		go PrefixSum(data[mid:], output[mid:], right)
		leftSum := <-left  // the left child has computed its value and now its sending u its result 
		parent <- leftSum + <- right // the right child is also sending u its result. In turn, you're sending your parent your value
		fromLeft := <-parent // this is the value your parent is passing to you of its left child... 
		left <- fromLeft // and now you're passing it onwards to your left child...
		right <- fromLeft + leftSum // the right child will get the value of 0 - (n-4) from 'fromLeft' and n-1 , n-2 from 'leftSum'
		<-left // now you're waiting for your left and right children to complete
		<-right		
	} else if len(data) == 1 {
		parent <- data[0]
		output[0] = data[0] + <- parent // so umm i believe the right = fromLeft + leftSum is happening here
	} else {
		parent<- 0
		<-parent
	}
	parent <- 0 // when i'm done computing the values of my left and right children only then can you go on with your backtracking
}

func main() {
	data := []int{6, 4, 16, 10, 16, 14, 2, 8}
	output := make([]int, len(data))
	parent := make(chan int)
	go PrefixSum(data, output, parent)
	sum := <-parent
	//fromLeft := 0
	parent <- 0
	<-parent
	//fmt.Println(doneZero)
	fmt.Printf("%v\n%v\n%d", data, output, sum)
}