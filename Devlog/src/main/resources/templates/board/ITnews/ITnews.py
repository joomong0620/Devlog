import requests
from bs4 import BeautifulSoup

url = 'https://v.daum.net/v/20251211174311914'

response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")

# 제목
title = soup.find("h3", class_="tit_view").get_text(strip=True)

# 기자명
reporter = soup.find("span", class_="txt_info").get_text(strip=True)

# 기사 날짜
num_date = soup.find("span", class_="num_date").get_text(strip=True)


# 이미지 URL
figure = soup.find("figure", class_="origin_fig")
img_tag = figure.find("img") if figure else None
image_url = img_tag["src"] if img_tag else "이미지 없음"

# 본문
content = soup.select_one('.article_view')

paragraphs = []

for p in content.select('p'):
    text = p.get_text(strip=True)
    if text:
        paragraphs.append(text)




print("제목:", title)
print("기자명:", reporter)
print("기사 날짜:", num_date)
print("이미지 URL:", image_url)
print("\n본문:")
for i, p in enumerate(paragraphs, 1):
    print(f"{i}. {p}")