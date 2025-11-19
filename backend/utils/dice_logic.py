import math
import random

def rejection_sample(n: int) -> int:
    k = math.ceil(math.log2(n))
    max_state = 2 ** k

    while True:
        state = random.randrange(0, max_state)
        if state < n:
            return state

def exact_sample(n: int):
    # TODO: implement later
    raise NotImplementedError("Exact sampling not implemented yet.")
