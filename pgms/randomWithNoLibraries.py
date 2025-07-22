def init_rng(seed=1):
    state = {
        "seed": seed,
        "a": 1664525,
        "c": 1013904223,
        "m": 2**32
    }
    return state

def next_rand(state):
    old_seed = state["seed"]
    state["seed"] = (state["a"] * state["seed"] + state["c"]) % state["m"]
    return state["seed"]

def randint(state, min_val, max_val):
    rand_val = next_rand(state)
    result = min_val + (rand_val % (max_val - min_val + 1))
    return result

rng_state = init_rng(seed=42)


#\-~---------EXAMPLE----------~-/#
randint(rng_state, 1, 10)
