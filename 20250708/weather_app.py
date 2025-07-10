import requests # [cite: 48] 引入 requests 模組，用於發送 HTTP 請求
import json # 引入 json 模組，用於處理 JSON (儘管 requests.json() 已處理，但了解其存在很有用)

def get_weather(city):
    API_KEY = "abe5e68b31b49e1715fca1d3fcd3655e" # [cite: 49] 請替換成您的 OpenWeatherMap API Key
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric" # [cite: 51]

    try:
        response = requests.get(url) # [cite: 53] 發送同步 GET 請求
        response.raise_for_status()  # 如果 HTTP 請求返回錯誤狀態碼，則拋出異常

        data = response.json() # [cite: 54] 將回應內容解析為 Python 字典/列表結構

        # [cite: 55, 56, 57] 提取並列印關鍵天氣資訊
        city_name = data['name']
        temperature = data['main']['temp']
        description = data['weather'][0]['description']

        print(f"城市: {city_name}")
        print(f"溫度: {temperature}°C")
        print(f"天氣: {description}")
        return True # 表示成功獲取並列印

    except requests.exceptions.RequestException as e:
        print(f"網路錯誤或API請求失敗: {e}")
        print(f"請檢查城市名稱或您的API Key是否正確。")
        return False
    except KeyError as e:
        print(f"API 回應格式錯誤或缺少鍵值: {e}")
        print(f"原始回應: {response.text if 'response' in locals() else '無回應'}")
        return False
    except Exception as e:
        print(f"發生未知錯誤: {e}")
        return False

if __name__ == "__main__":
    input_city = input("請輸入城市名稱 (例如: Taipei): ")
    if input_city:
        get_weather(input_city)
    else:
        print("未輸入城市名稱。")