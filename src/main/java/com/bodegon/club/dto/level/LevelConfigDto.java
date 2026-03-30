package com.bodegon.club.dto.level;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

public class LevelConfigDto {

    @Getter
    @Setter
    public static class Request {
        @Min(0)
        private int threshold;

        @NotNull
        private List<String> perks;
    }

    @Getter
    @Builder
    public static class Response {
        private String level;
        private int threshold;
        private List<String> perks;
    }
}
