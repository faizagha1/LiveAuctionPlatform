package com.liveauction.userandauthentication.dto.response;

public record UpdateResponse(
        String fieldChanged,
        String message
) {
    public static UpdateResponse fromField(String field) {
        return new UpdateResponse(
                field,
                field + "changed successfully"
        );
    }
}
