import requests
API_KEY = "de2821159816f4142e7c0dce50c4f07f"
city = "Yilan"
url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
2
response = requests.get(url)
data = response.json()
print("城市：", data['name'])
print("溫度：", data['main']['temp'], "°C")
print("天氣：", data['weather'][0]['description'])