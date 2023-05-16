from flask import Flask, render_template, jsonify
import pandas as pd
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data')
def get_data():
    data = []
    base_population = {
        "Travis": 1000000,
        "Blanco": 12000,
        "Hays": 230000,
        "Comal": 150000,
    }

    growth_rates = {
        "Travis": 0.03,
        "Blanco": 0.04,
        "Hays": 0.05,
        "Comal": 0.06,
    }

    for year in range(2020, 2026):
        for county, population in base_population.items():
            growth_rate = growth_rates[county]
            growth = (year - 2020) * growth_rate * 100
            data.append({
                "year": year,
                "county": county,
                "population": population * (1 + (year - 2020) * growth_rate),
                "growth": growth
            })

    return jsonify(data)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 4000)), debug=True)
