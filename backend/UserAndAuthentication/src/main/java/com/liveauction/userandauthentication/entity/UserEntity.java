package com.liveauction.userandauthentication.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity extends BaseEntity implements UserDetails {

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    /**
     * -- GETTER --
     *  Returns the *email* for authentication requests (e.g., login form).
     *  Note: This is a separate method to avoid conflicts with getUsername().
     */
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 60) // BCrypt hashes are 60 chars
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.UNVERIFIED;

    @Column(precision = 3, scale = 2)
    private BigDecimal auctioneerRating;

    @ManyToMany(fetch = FetchType.EAGER) // EAGER fetch is required for Security
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<RoleEntity> roles = new HashSet<>();

    /**
     * Defines the status of a user account.
     */
    public enum UserStatus {
        ACTIVE,      // Email verified, can use platform
        UNVERIFIED,  // Registered but email not yet verified
        SUSPENDED    // Admin suspended the account
    }

    /**
     * Gathers all authorities (Roles + Permissions) for Spring Security.
     * Roles are prefixed with "ROLE_".
     * Permissions are direct (e.g., "VIEW_ITEM").
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Collect all role names
        Set<GrantedAuthority> authorities = roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toSet());

        // Collect all unique permission names from all roles
        authorities.addAll(
                roles.stream()
                        .flatMap(role -> role.getPermissions().stream())
                        .map(permission -> new SimpleGrantedAuthority(permission.getName()))
                        .collect(Collectors.toSet())
        );

        return authorities;
    }

    /**
     * Returns the *actual username* (e.g., "john-doe").
     * Note: This is a separate method to avoid conflicts with getUsername().
     */
    public String getRealUsername() {
        return this.username;
    }

    @Override
    public String getPassword() {
        return password;
    }

    /**
     * IMPORTANT: Returns the User's UUID (ID) as a string.
     * Spring Security's UserDetails::getUsername() is used as the *principal identifier*.
     * In this application, the unique, stable identifier is the User's ID (UUID), not their email or username.
     * This ID is embedded in the JWT 'sub' (subject) claim.
     */
    @Override
    public String getUsername() {
        return this.getId().toString();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Not implemented
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != UserStatus.SUSPENDED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Not implemented
    }

    @Override
    public boolean isEnabled() {
        return status == UserStatus.ACTIVE;
    }
}