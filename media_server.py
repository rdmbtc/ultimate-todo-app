import asyncio
import base64
from io import BytesIO
from flask import Flask, jsonify, request
from flask_cors import CORS
from winsdk.windows.media.control import GlobalSystemMediaTransportControlsSessionManager
from winsdk.windows.storage.streams import DataReader, Buffer, InputStreamOptions

app = Flask(__name__)
CORS(app)

async def get_media_session():
    sessions = await GlobalSystemMediaTransportControlsSessionManager.request_async()
    return sessions.get_current_session()

async def get_media_info_async():
    session = await get_media_session()
    if not session:
        return None

    info = await session.try_get_media_properties_async()
    timeline = session.get_timeline_properties()
    
    # Get Thumbnail
    thumbnail_b64 = None
    if info.thumbnail:
        try:
            stream = await info.thumbnail.open_read_async()
            size = stream.size
            buffer = Buffer(size)
            reader = DataReader(stream)
            await reader.load_async(size)
            data = reader.read_buffer(size)
            
            # Convert buffer to bytes - this part can be tricky with winsdk
            # We'll use a simpler approach if possible, or just skip thumbnail for MVP if complex
            # For now, let's try reading into a byte array
            data_bytes = bytearray(size)
            reader_bytes = DataReader.from_buffer(data)
            reader_bytes.read_bytes(data_bytes)
            thumbnail_b64 = base64.b64encode(data_bytes).decode('utf-8')
        except Exception as e:
            print(f"Error reading thumbnail: {e}")

    return {
        "title": info.title,
        "artist": info.artist,
        "album_artist": info.album_artist,
        "album_title": info.album_title,
        "thumbnail": f"data:image/jpeg;base64,{thumbnail_b64}" if thumbnail_b64 else None,
        "status": session.get_playback_info().playback_status.value, # 4=Playing, 5=Paused
        "position": timeline.position.total_seconds() if timeline else 0,
        "duration": timeline.end_time.total_seconds() if timeline else 0,
    }

async def control_media_async(command):
    session = await get_media_session()
    if not session:
        return False
    
    if command == "play":
        return await session.try_play_async()
    elif command == "pause":
        return await session.try_pause_async()
    elif command == "next":
        return await session.try_skip_next_async()
    elif command == "prev":
        return await session.try_skip_previous_async()
    elif command == "toggle":
        return await session.try_toggle_play_pause_async()
    
    return False

@app.route('/current-media', methods=['GET'])
def current_media():
    try:
        info = asyncio.run(get_media_info_async())
        if info:
            return jsonify(info)
        return jsonify({"status": "idle", "title": "No Media Playing", "artist": ""})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/control', methods=['POST'])
def control_media():
    data = request.json
    command = data.get('command')
    if not command:
        return jsonify({"error": "No command provided"}), 400
    
    success = asyncio.run(control_media_async(command))
    return jsonify({"success": success})

if __name__ == '__main__':
    print("Starting Windows Media Bridge on port 5000...")
    app.run(port=5000)
