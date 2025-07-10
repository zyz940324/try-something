
// WeatherFetcher.java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

// 從 org.json 函式庫導入 JSONObject 及相關類別
import org.json.JSONObject;

public class WeatherFetcher {

    public static void main(String[] args) {
        // --- 重要：將 "YOUR_API_KEY" 替換為你實際的 OpenWeatherMap API 金鑰 ---
        String apiKey = "5fd620cd38c1a177907993ad16916df9";
        String location = "Taipei"; // 你可以將這個改為任何城市
        String urlStr = "http://api.openweathermap.org/data/2.5/weather?q=" + location +
                "&appid=" + apiKey + "&units=metric"; // 添加 &units=metric 以顯示攝氏度

        try {
            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            int responseCode = conn.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) { // 200 OK
                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                String inputLine;
                StringBuilder content = new StringBuilder(); // 使用 StringBuilder 提高效率
                while ((inputLine = in.readLine()) != null) {
                    content.append(inputLine);
                }
                in.close();
                conn.disconnect(); // 斷開連接

                // 解析 JSON 回應
                JSONObject obj = new JSONObject(content.toString());

                // 提取數據 (如果需要更穩健，可以添加鍵是否存在檢查)
                String cityName = obj.getString("name");
                double temperatureCelsius = obj.getJSONObject("main").getDouble("temp");
                String description = obj.getJSONArray("weather").getJSONObject(0).getString("description");

                System.out.println("城市：" + cityName);
                System.out.println("溫度：" + temperatureCelsius + " °C");
                System.out.println("天氣描述：" + description);

                // 你可以進一步探索 'obj' 以獲取更多數據，如濕度、風速等。
                // System.out.println("濕度：" + obj.getJSONObject("main").getInt("humidity") +
                // "%");

            } else {
                System.out.println("請求失敗，狀態碼：" + responseCode);
                // 如果有錯誤流，讀取它以獲取更多失敗詳情
                try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(conn.getErrorStream()))) {
                    String errorLine;
                    StringBuilder errorContent = new StringBuilder();
                    while ((errorLine = errorReader.readLine()) != null) {
                        errorContent.append(errorLine);
                    }
                    if (errorContent.length() > 0) {
                        System.out.println("錯誤響應：" + errorContent.toString());
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("發生錯誤：" + e.getMessage());
            e.printStackTrace(); // 列印完整的堆疊追蹤以便除錯
        }
    }
}