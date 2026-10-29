package com.cclinux.projects.meetroom.service.cust;

import cn.hutool.core.util.StrUtil;
import com.cclinux.framework.exception.AppException;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.cclinux.framework.core.mapper.Where;
import com.cclinux.projects.meetroom.mapper.MeetMapper;
import com.cclinux.projects.meetroom.model.MeetModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Resource;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.time.Duration;
import java.util.Locale;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.Collections;

/** OpenAI-compatible AI assistant, adapted from the Tianji AIGC configuration pattern. */
@Service("MeetRoomAiAssistantService")
public class AiAssistantService extends BaseMyCustService {
    private static final Logger LOG = LoggerFactory.getLogger(AiAssistantService.class);
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8)).build();
    private static final String SYSTEM_PROMPT = "你是 TurboRoom 校园自习预约系统的 AI 助手。仅协助场地推荐、预约流程解释和校园公告生成。" +
            "用中文简洁回答。场地推荐最多列出 3 个候选项，必须说明容量和匹配理由；缺少日期、时段或人数时先指出缺失信息。" +
            "不要承诺预约成功，最终提醒用户在系统中核对可用日期、时段与余量。公告润色请按标题、正文输出。" +
            "请结合提供的历史对话理解上下文；用户说继续、扩写、修改、缩短等指代性要求时，直接以最近相关回答为基础处理，不要重复要求用户提供已有内容。" +
            "不要索取或输出密码、验证码、手机号等敏感信息，也不要编造不存在的场地或实时余量。";

    @Resource(name = "MeetRoomMeetMapper")
    private MeetMapper meetMapper;

    @Resource(name = "MeetRoomMeetService")
    private MeetService meetService;

    @Autowired
    private Environment env;

    public String chat(String question, String scene, List<Map<String, String>> history) {
        if (StrUtil.isBlank(question) || question.trim().length() > 2000) throw new AppException("请输入 1 至 2000 个字符的问题");
        String enabled = setting("AI_ENABLED");
        String apiKey = setting("AI_API_KEY");
        if (!"true".equalsIgnoreCase(enabled) || StrUtil.isBlank(apiKey)) {
            throw new AppException("AI 助手尚未配置。请设置 AI_ENABLED=true 和 AI_API_KEY 后重启后端服务。");
        }
        String baseUrl = setting("AI_BASE_URL");
        if (StrUtil.isBlank(baseUrl)) baseUrl = "https://api.openai.com/v1";
        String model = setting("AI_MODEL");
        if (StrUtil.isBlank(model)) model = "gpt-4o-mini";
        JsonArray messages = new JsonArray();
        // 只携带与当前问题相关的精简场地数据，减少模型输入 token 和首包等待时间。
        messages.add(message("system", SYSTEM_PROMPT + "\n\n当前可用场地数据（只可基于这些数据推荐）：\n" + venueContext(question)));
        messages.addAll(historyMessages(history));
        messages.add(message("user", StrUtil.isBlank(scene) ? question.trim() : "当前场景：" + scene.trim() + "\n用户问题：" + question.trim()));
        JsonObject payload = new JsonObject();
        payload.addProperty("model", model); payload.add("messages", messages);
        payload.addProperty("temperature", 0.2);
        payload.addProperty("max_tokens", 500);
        try {
            String endpoint = baseUrl.replaceAll("/+$", "") + "/chat/completions";
            HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint)).timeout(Duration.ofSeconds(90))
                    .header("Content-Type", "application/json").header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(payload.toString())).build();
            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                String detail = response.body();
                if (detail != null && detail.length() > 500) detail = detail.substring(0, 500);
                throw new AppException("AI 服务暂时不可用（HTTP " + response.statusCode() + "）：" + (StrUtil.isBlank(detail) ? "请检查模型名称或推理接入点。" : detail));
            }
            String answer = JsonParser.parseString(response.body()).getAsJsonObject().getAsJsonArray("choices").get(0).getAsJsonObject().getAsJsonObject("message").get("content").getAsString();
            if (StrUtil.isBlank(answer)) throw new AppException("AI 未返回有效内容，请稍后重试。");
            return answer.trim();
        } catch (AppException e) { throw e; }
        catch (HttpTimeoutException e) {
            LOG.warn("AI model request timed out; model={}, timeoutSeconds=90, exception={}", model, e.getClass().getSimpleName());
            throw new AppException("AI 模型响应超时，请检查模型服务状态后重试。");
        }
        catch (Exception e) { throw new AppException("AI 请求失败（" + e.getClass().getSimpleName() + "），请检查网络、模型地址和 AI_API_KEY 配置。"); }
    }

    private JsonArray historyMessages(List<Map<String, String>> history) {
        JsonArray result = new JsonArray();
        if (history == null || history.isEmpty()) return result;
        List<JsonObject> recent = new ArrayList<>();
        int totalChars = 0;
        for (int i = history.size() - 1; i >= 0 && recent.size() < 12 && totalChars < 12000; i--) {
            Map<String, String> item = history.get(i);
            if (item == null) continue;
            String role = item.get("role"), content = item.get("content");
            if ((!"user".equals(role) && !"assistant".equals(role)) || StrUtil.isBlank(content)) continue;
            int remaining = 12000 - totalChars;
            content = content.trim();
            if (content.length() > 3000) content = content.substring(0, 3000);
            if (content.length() > remaining) content = content.substring(content.length() - remaining);
            if (StrUtil.isBlank(content)) break;
            recent.add(message(role, content));
            totalChars += content.length();
        }
        Collections.reverse(recent);
        for (JsonObject item : recent) result.add(item);
        return result;
    }

    /**
     * 基于真实预约记录返回候选场地和冲突候补。本方法只读数据，不会自动创建预约。
     */
    public List<Map<String, Object>> recommend(String day, String time, int people, String category, String requirement) {
        if (StrUtil.isBlank(day) || StrUtil.isBlank(time) || people <= 0)
            throw new AppException("请填写预约日期、时段和人数后再获取实时推荐");
        List<Map<String, Object>> candidates = meetService.getAvailability(day, time, people, category);
        candidates.sort((left, right) -> {
            boolean leftAvailable = Boolean.TRUE.equals(left.get("available"));
            boolean rightAvailable = Boolean.TRUE.equals(right.get("available"));
            if (leftAvailable != rightAvailable) return leftAvailable ? -1 : 1;
            long leftRemaining = ((Number) left.get("remaining")).longValue();
            long rightRemaining = ((Number) right.get("remaining")).longValue();
            return Long.compare(leftRemaining, rightRemaining);
        });
        for (Map<String, Object> item : candidates) {
            boolean available = Boolean.TRUE.equals(item.get("available"));
            long remaining = ((Number) item.get("remaining")).longValue();
            item.put("reason", available
                    ? "满足 " + people + " 人需求，当前时段剩余 " + remaining + " 个名额" + (StrUtil.isBlank(requirement) ? "" : "；已记录需求：" + requirement)
                    : "当前时段余量不足（剩余 " + remaining + " 个），可作为候补参考");
        }
        // 与系统提示词和前端展示约定保持一致，最多返回 3 个候选，避免推荐卡片过长。
        return candidates.size() > 3 ? candidates.subList(0, 3) : candidates;
    }
    /** JVM -D 参数优先，其次读取操作系统环境变量，最后读取 Spring application.yml，避免将密钥提交进项目文件。 */
    private String setting(String key) {
        String value = System.getProperty(key);
        if (StrUtil.isNotBlank(value)) return value;
        value = System.getenv(key);
        if (StrUtil.isNotBlank(value)) return value;
        String yamlKey = "ai." + key.substring(3).toLowerCase(Locale.ROOT).replace('_', '-');
        return env.getProperty(yamlKey);
    }
    private String venueContext(String question) {
        Where<MeetModel> where = new Where<>();
        where.eq("MEET_STATUS", MeetModel.STATUS.NORMAL);
        where.orderByAsc("MEET_ORDER");
        java.util.List<java.util.Map<String, Object>> venues = meetMapper.getAllListMap(where, "MEET_TITLE,MEET_CATE_NAME,MEET_MAX_CNT,MEET_DAYS");
        StringBuilder text = new StringBuilder();
        String keywords = question.toLowerCase(Locale.ROOT);
        java.util.List<java.util.Map<String, Object>> matched = new java.util.ArrayList<>();
        for (java.util.Map<String, Object> venue : venues) {
            String title = String.valueOf(venue.get("meetTitle"));
            String category = String.valueOf(venue.get("meetCateName"));
            if ((keywords.contains("电脑") && category.contains("计算机")) ||
                    (keywords.contains("体育") && category.contains("体育")) ||
                    (keywords.contains("健身") && category.contains("健身")) ||
                    (keywords.contains("艺术") && category.contains("艺术")) ||
                    (keywords.contains("语音") && category.contains("语音")) ||
                    (keywords.contains("实验") && category.contains("实验")) ||
                    (keywords.contains("阶梯") && category.contains("阶梯")) ||
                    title.toLowerCase(Locale.ROOT).contains(keywords)) matched.add(venue);
        }
        java.util.List<java.util.Map<String, Object>> selected = matched.isEmpty() ? venues : matched;
        text.append("已启用场地总数：").append(venues.size()).append("。以下为相关候选：\n");
        for (int i = 0; i < Math.min(selected.size(), 16); i++) {
            java.util.Map<String, Object> venue = selected.get(i);
            text.append(i + 1).append(". ").append(venue.get("meetTitle")).append("｜")
                    .append(venue.get("meetCateName")).append("｜容量 ").append(venue.get("meetMaxCnt"))
                    .append(" 人｜开放日期 ").append(venue.get("meetDays")).append("\n");
        }
        return text.toString();
    }
    private JsonObject message(String role, String content) { JsonObject m = new JsonObject(); m.addProperty("role", role); m.addProperty("content", content); return m; }
}
