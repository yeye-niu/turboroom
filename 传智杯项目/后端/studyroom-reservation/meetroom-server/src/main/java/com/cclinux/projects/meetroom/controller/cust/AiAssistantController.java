package com.cclinux.projects.meetroom.controller.cust;

import cn.hutool.core.map.MapUtil;
import com.cclinux.framework.annotation.LoginIgnore;
import com.cclinux.framework.core.domain.ApiResult;
import com.cclinux.projects.meetroom.service.cust.AiAssistantService;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@RestController("MeetRoomAiAssistantController")
public class AiAssistantController extends BaseMyCustController {
    @Resource(name = "MeetRoomAiAssistantService") private AiAssistantService aiAssistantService;
    @LoginIgnore
    @RequestMapping(value = "/ai/chat")
    public ApiResult chat(@RequestBody Map<String, Object> input) {
        return ApiResult.success(MapUtil.of("answer", aiAssistantService.chat(
                MapUtil.getStr(input, "question"), MapUtil.getStr(input, "scene"), history(input.get("history")))));
    }

    private List<Map<String, String>> history(Object raw) {
        List<Map<String, String>> result = new ArrayList<>();
        if (!(raw instanceof List<?>)) return result;
        for (Object entry : (List<?>) raw) {
            if (!(entry instanceof Map<?, ?>)) continue;
            Map<?, ?> item = (Map<?, ?>) entry;
            Map<String, String> message = new HashMap<>();
            Object role = item.get("role"), content = item.get("content");
            if (role instanceof String) message.put("role", (String) role);
            if (content instanceof String) message.put("content", (String) content);
            result.add(message);
        }
        return result;
    }

    @LoginIgnore
    @RequestMapping(value = "/ai/suspended-chat")
    public Map<String, Object> suspendedChat(@RequestBody Map<String, Object> input) {
        String question = MapUtil.getStr(input, "question");
        String answer = aiAssistantService.chat(question, MapUtil.getStr(input, "scene"), history(input.get("history")));
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("code", 0);
        result.put("result", MapUtil.of("answer", answer));
        return result;
    }

    @LoginIgnore
    @RequestMapping(value = "/ai/recommend")
    public ApiResult recommend(@RequestBody Map<String, Object> input) {
        return ApiResult.success(aiAssistantService.recommend(
                MapUtil.getStr(input, "day"), MapUtil.getStr(input, "time"), MapUtil.getInt(input, "people", 0),
                MapUtil.getStr(input, "category"), MapUtil.getStr(input, "requirement")));
    }
}
