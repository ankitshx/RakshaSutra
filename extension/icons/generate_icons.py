import os
import struct
import zlib

def make_png(width, height, draw_func):
    """Generate a valid PNG image byte array without external dependencies."""
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter type None
        for x in range(width):
            r, g, b, a = draw_func(x, y, width, height)
            raw_data.extend([r, g, b, a])
    
    compressed = zlib.compress(bytes(raw_data), 9)
    
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    # IDAT chunk
    idat_crc = zlib.crc32(b'IDAT' + compressed) & 0xffffffff
    png += struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)
    
    # IEND chunk
    iend_crc = zlib.crc32(b'IEND') & 0xffffffff
    png += struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    
    return png

def draw_shield_icon(x, y, w, h):
    # Normalize coords (-1.0 to 1.0)
    nx = (x - w / 2) / (w / 2)
    ny = (y - h / 2) / (h / 2)
    
    dist_sq = nx * nx + ny * ny
    if dist_sq > 0.95:
        return 0, 0, 0, 0 # Transparent background
    
    # Background circle dark cyber navy
    bg_r, bg_g, bg_b = 6, 12, 28
    
    # Shield shape formula
    in_shield = False
    if ny > -0.7 and ny < 0.75 and abs(nx) < 0.65:
        # Top flat / angled
        if ny < 0.1:
            if abs(nx) < 0.6:
                in_shield = True
        else:
            # Bottom curves inward
            curve = 0.6 - (ny - 0.1) * 0.7
            if abs(nx) < max(0.05, curve):
                in_shield = True
    
    if in_shield:
        # Cyan neon shield
        if abs(nx) > 0.45 or ny < -0.55 or (ny > 0.1 and abs(nx) > curve - 0.12):
            return 0, 240, 255, 255 # Bright Cyan border
        # Inner lock / check
        if abs(nx) < 0.2 and abs(ny) < 0.3:
            return 255, 255, 255, 255 # White center core
        return 0, 160, 220, 255 # Cyan fill
    
    # Outer circle border
    if dist_sq > 0.8:
        return 0, 240, 255, 220
        
    return bg_r, bg_g, bg_b, 255

def main():
    out_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(out_dir, exist_ok=True)
    
    sizes = [16, 32, 48, 128]
    for size in sizes:
        png_bytes = make_png(size, size, draw_shield_icon)
        file_path = os.path.join(out_dir, f'icon-{size}.png')
        with open(file_path, 'wb') as f:
            f.write(png_bytes)
        print(f"Generated {file_path} ({len(png_bytes)} bytes)")

if __name__ == '__main__':
    main()
