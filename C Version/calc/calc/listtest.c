#include <stdio.h>

#include "list.h"

List(ints, int, i_)

int main(int argc, char** argv) {
	ints numbers;
	i_init(&numbers);
	
	for(int cou = 0; cou < 40; cou++) {
		i_unshift(&numbers, cou);
	}
	
	size_t limit = numbers.length;
	for(int cou = 0; cou < limit; cou++) {
		printf("%d\n", i_pop(&numbers));
	}
	
	return 0;
}
