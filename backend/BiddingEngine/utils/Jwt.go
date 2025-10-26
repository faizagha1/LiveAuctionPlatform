package utils

import (
	"encoding/base64"
	"fmt"
	"log"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret []byte

// InitJWT initializes the JWT secret key
// The secret should be Base64 encoded to match Java's behavior
func InitJWT(secret string) {
	// Base64 decode the secret to match Java's Decoders.BASE64.decode()
	decoded, err := base64.StdEncoding.DecodeString(secret)
	if err != nil {
		// If it's not valid Base64, use it as-is (fallback)
		log.Printf("⚠️  Warning: Secret is not valid Base64, using raw string: %v\n", err)
		jwtSecret = []byte(secret)
		return
	}
	jwtSecret = decoded
	log.Printf("🔑 JWT Secret decoded from Base64 (%d bytes)\n", len(jwtSecret))
}

// ValidateJWT validates a JWT token and returns the parsed token
func ValidateJWT(tokenString string) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Verify the signing method is HMAC (HS256, HS384, or HS512)
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if !token.Valid {
		return nil, fmt.Errorf("token is invalid")
	}

	return token, nil
}

// ExtractUserId extracts the user ID from the token's subject claim
func ExtractUserId(token *jwt.Token) (string, error) {
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", fmt.Errorf("invalid token claims")
	}

	sub, ok := claims["sub"].(string)
	if !ok {
		return "", fmt.Errorf("subject claim not found or invalid")
	}

	return sub, nil
}

// ExtractUsername extracts the username from the token claims
func ExtractUsername(token *jwt.Token) (string, error) {
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", fmt.Errorf("invalid token claims")
	}

	username, ok := claims["username"].(string)
	if !ok {
		return "", fmt.Errorf("username claim not found or invalid")
	}

	return username, nil
}

// ExtractRoles extracts the roles from the token claims
func ExtractRoles(token *jwt.Token) ([]string, error) {
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fmt.Errorf("invalid token claims")
	}

	rolesInterface, ok := claims["roles"].([]interface{})
	if !ok {
		return nil, fmt.Errorf("roles claim not found or invalid")
	}

	roles := make([]string, len(rolesInterface))
	for i, role := range rolesInterface {
		roles[i], ok = role.(string)
		if !ok {
			return nil, fmt.Errorf("invalid role format")
		}
	}

	return roles, nil
}
