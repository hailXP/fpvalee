from flask import Flask, request, jsonify, abort
import flask_cors
import chess
import chess.engine
import os
import logging

app = Flask(__name__)
app.logger.setLevel(logging.WARNING)
flask_cors.CORS(app)

STOCKFISH_PATH = "Model/stockfish.exe"

if not os.path.exists(STOCKFISH_PATH):
    raise FileNotFoundError(f"Stockfish executable not found at path: {STOCKFISH_PATH}")

stockfish_engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)

@app.route("/threats", methods=['GET'])
def threats():
    fen = request.args.get('fen')
    board = chess.Board(fen)
    
    board.turn = not board.turn

    try:
        result = stockfish_engine.analyse(board, chess.engine.Limit(depth=12))
        from_square = chess.SQUARE_NAMES[result["pv"][0].from_square]
        to_square = chess.SQUARE_NAMES[result["pv"][0].to_square]

        markings = [{
            "type": 'arrow',
            "data": {
                "from": from_square,
                "to": to_square,
                "color": 'red',
                "opacity": 0.6
            },
            "node": True,
            "persistent": False
        }]

        return jsonify(markings=markings)
    except Exception as e:
        abort(500, description=f"Engine error: {e}")

@app.route("/evaluate", methods=['GET'])
def evaluate():
    fen = request.args.get('fen')
    board = chess.Board(fen)

    try:
        info = stockfish_engine.analyse(board, chess.engine.Limit(depth=12))
        score = info["score"].white()

        if score.is_mate():
            if score.mate() < 0:
                eval_score = f"-M({abs(score.mate())})"
            else:
                eval_score = f'M{score.mate()}'
        else:
            eval_score = f'{round(score.score()/100, 2)}'

        return jsonify(score=eval_score)
    except Exception as e:
        abort(500, description=f"Engine error: {e}")

if __name__ == "__main__":
    app.run(debug=True)
