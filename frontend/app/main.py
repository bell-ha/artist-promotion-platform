@app.get("/api/artists")
def get_artists():
    return [
        {"id": 1, "name": "Artist A"},
        {"id": 2, "name": "Artist B"},
    ]
