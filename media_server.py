import asyncio
import base64
from io import BytesIO
from flask import Flask, jsonify, request
from flask_cors import CORS
from winsdk.windows.media.control import GlobalSystemMediaTransportControlsSessionManager
from winsdk.windows.storage.streams import DataReader, Buffer, InputStreamOptions
from PIL import Image

app = Flask(__name__)
CORS(app)

async def get_media_session():
    sessions = await GlobalSystemMediaTransportControlsSessionManager.request_async()
    return sessions.get_current_session()

def get_dominant_color(image_data):
    try:
        image = Image.open(BytesIO(image_data))
        image = image.convert("RGB")
        image = image.resize((50, 50))
        
        # Convert to HSV for better color analysis
        hsv_image = image.convert("HSV")
        hsv_pixels = list(hsv_image.getdata())
        rgb_pixels = list(image.getdata())
        
        max_score = 0
        dominant_color = None
        
        for i in range(len(hsv_pixels)):
            h, s, v = hsv_pixels[i]
            r, g, b = rgb_pixels[i]
            
            # Normalize HSV (0-255) to 0-1
            s_norm = s / 255.0
            v_norm = v / 255.0
            
            # Skip grays, blacks, and whites
            # Saturation < 0.2 is too gray
            # Value < 0.2 is too black
            # Value > 0.95 is too white
            if s_norm < 0.2 or v_norm < 0.2 or v_norm > 0.95:
                continue
                
            # Score = Saturation^2 * Value (favor saturation heavily)
            score = (s_norm ** 2) * v_norm
            
            if score > max_score:
                max_score = score
                dominant_color = (r, g, b)
        
        if dominant_color:
            return '#{:02x}{:02x}{:02x}'.format(dominant_color[0], dominant_color[1], dominant_color[2])
            
        # Fallback: Try to find ANY color that isn't strict black/white
        for r, g, b in rgb_pixels:
             if (r > 40 or g > 40 or b > 40) and (r < 240 or g < 240 or b < 240):
                 return '#{:02x}{:02x}{:02x}'.format(r, g, b)

        # Ultimate Fallback to average
        image = image.resize((1, 1))
        color = image.getpixel((0, 0))
        return '#{:02x}{:02x}{:02x}'.format(color[0], color[1], color[2])
        
    except Exception as e:
        with open("debug_log.txt", "a") as f:
            f.write(f"Error extracting color: {e}\n")
        return None

async def get_media_info_async():
    session = await get_media_session()
    if not session:
        return None

    info = await session.try_get_media_properties_async()
    timeline = session.get_timeline_properties()
    
    # Get Thumbnail
    thumbnail_b64 = None
    dominant_color = None
    
    if info.thumbnail:
        try:
            stream = await info.thumbnail.open_read_async()
            size = stream.size
            buffer = Buffer(size)
            reader = DataReader(stream)
            await reader.load_async(size)
            data = reader.read_buffer(size)
            
            data_bytes = bytearray(size)
            reader_bytes = DataReader.from_buffer(data)
            reader_bytes.read_bytes(data_bytes)
            
            thumbnail_b64 = base64.b64encode(data_bytes).decode('utf-8')
            dominant_color = get_dominant_color(data_bytes)
            
        except Exception as e:
            print(f"Error reading thumbnail: {e}")

    return {
        "title": info.title,
        "artist": info.artist,
        "album_artist": info.album_artist,
        "album_title": info.album_title,
        "thumbnail": f"data:image/jpeg;base64,{thumbnail_b64}" if thumbnail_b64 else None,
        "color": dominant_color,
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
