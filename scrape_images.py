import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

url = "https://www.mialumialu.com"
out_dir = "/Users/lxn/Documents/orange-time/orange-time-fronent/public/default-covers"

print(f"Fetching {url} ...")
response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
soup = BeautifulSoup(response.text, 'html.parser')

print("Extracting images...")
imgs = soup.find_all('img')

downloaded = 0
for i, img in enumerate(imgs):
    if downloaded >= 10:
        break
        
    src = img.get('src')
    if not src:
        src = img.get('data-src')
        
    if not src:
        continue
        
    # Get high res version if wix image
    if 'static.wixstatic.com' in src:
        src = src.split('/v1/')[0]
        
    img_url = urljoin(url, src)
    
    # Try to filter out tiny icons
    if 'favicon' in img_url.lower() or 'logo' in img_url.lower():
        continue
        
    try:
        print(f"Downloading {img_url} ...")
        # Need user agent for wix sometimes
        img_resp = requests.get(img_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        
        # Determine extension
        ext = '.jpg'
        if 'png' in img_url.lower(): ext = '.png'
        elif 'webp' in img_url.lower(): ext = '.webp'
        elif 'avif' in img_url.lower(): ext = '.avif'
            
        filename = f"mialu_{downloaded+1}{ext}"
        filepath = os.path.join(out_dir, filename)
        
        with open(filepath, 'wb') as f:
            f.write(img_resp.content)
            
        print(f"Saved to {filename}")
        downloaded += 1
    except Exception as e:
        print(f"Error downloading {img_url}: {e}")

print(f"Successfully downloaded {downloaded} images")
