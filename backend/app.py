from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def compare(a, b, strategy):
    return a > b if strategy == "max" else a < b


def heapify(arr, n, i, steps, strategy):
    extreme = i
    l = 2 * i + 1
    r = 2 * i + 2

    if l < n and compare(arr[l], arr[extreme], strategy):
        extreme = l

    if r < n and compare(arr[r], arr[extreme], strategy):
        extreme = r

    if extreme != i:
        arr[i], arr[extreme] = arr[extreme], arr[i]
        steps.append({
            "array": arr.copy(),
            "boundary": n
        })
        heapify(arr, n, extreme, steps, strategy)


def heap_sort(arr, strategy="max"):
    steps = []
    n = len(arr)

    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i, steps, strategy)

    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        steps.append({
            "array": arr.copy(),
            "boundary": i
        })
        heapify(arr, i, 0, steps, strategy)

    return steps


@app.route('/heap-sort', methods=['POST'])
def process_heap_sort():
    data = request.json.get("array", [])
    strategy = request.json.get("strategy", "max")

    steps = heap_sort(data.copy(), strategy)

    return jsonify({
        "status": "success",
        "strategy": strategy,
        "steps": steps
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)

