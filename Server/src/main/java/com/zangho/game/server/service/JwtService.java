package com.zangho.game.server.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.TokenExpiredException;
import com.zangho.game.server.define.AccountType;
import com.zangho.game.server.define.TokenType;
import com.zangho.game.server.domain.user.AuthedJwt;
import com.zangho.game.server.domain.user.DisposedToken;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.error.ErrorVerifyJWT;
import com.zangho.game.server.error.ErrorIssueJWT;
import com.zangho.game.server.repository.user.DisposedTokenRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.tuple.Pair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;

import java.util.Calendar;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

public class JwtService {

    private Logger logger = LoggerFactory.getLogger(JwtService.class);
    private final boolean isDevelopment;

    private DisposedTokenRepository disposedTokenRepository;

    @Value("${jwt.secret_key}")
    private String secretKey;

    @Value("${jwt.valid_issuer}")
    private String validIssuer;

    @Value("${jwt.valid_audiences:}")
    private String[] validAudiences;

    @Value("${jwt.access_expire_minutes:}")
    private int accessExpireMinutes;

    @Value("${jwt.refresh_expire_day:}")
    private int refreshExpireDay;

    public JwtService(DisposedTokenRepository disposedTokenRepository) {
        var config = System.getProperty("Config");
        isDevelopment = null == config || !config.equals("production");
        this.disposedTokenRepository = disposedTokenRepository;
    }

    public Pair<ErrorIssueJWT, String> issueAccessToken(User user) {
        try {
            var algorithm = Algorithm.HMAC512(secretKey);
            var now = new Date();
            var cal = Calendar.getInstance();
            cal.setTime(now);
            cal.add(Calendar.MINUTE, accessExpireMinutes);
            var expire = new Date(cal.getTimeInMillis());
            var jti = UUID.randomUUID().toString();

            var token = JWT.create()
                .withJWTId(jti)
                .withIssuer(validIssuer)
                .withAudience(validAudiences)
                .withNotBefore(now)
                .withIssuedAt(now)
                .withExpiresAt(expire)
                .withClaim("tkt", TokenType.ACCESS.getNumber())
                .withClaim("id", user.getId())
                .withClaim("accountType", user.getAccountType().getNumber())
                .withClaim("userName", user.getUsername())
                .withClaim("name", user.getName())
                .withClaim("nickName", user.getNickName())
                .sign(algorithm);

            return Pair.of(ErrorIssueJWT.NONE, token);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return Pair.of(ErrorIssueJWT.FAILED_TO_ISSUE, "");
        }
    }

    public Pair<ErrorIssueJWT, String> issueRefreshToken(User user) {
        try {
            var algorithm = Algorithm.HMAC512(secretKey);
            var now = new Date();
            var cal = Calendar.getInstance();
            cal.setTime(now);
            cal.add(Calendar.DATE, refreshExpireDay);
            var expire = new Date(cal.getTimeInMillis());
            var jti = UUID.randomUUID().toString();

            var token = JWT.create()
                .withJWTId(jti)
                .withIssuer(validIssuer)
                .withAudience(validAudiences)
                .withNotBefore(now)
                .withIssuedAt(now)
                .withExpiresAt(expire)
                .withClaim("tkt", TokenType.REFRESH.getNumber())
                .withClaim("id", user.getId())
                .withClaim("accountType", user.getAccountType().getNumber())
                .sign(algorithm);

            return Pair.of(ErrorIssueJWT.NONE, token);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return Pair.of(ErrorIssueJWT.FAILED_TO_ISSUE, "");
        }
    }

    public Pair<ErrorIssueJWT, Pair<String, String>> issueAccessTokenWithRefresh(User user) {
        try {
            var resultIssueAccessToken = issueAccessToken(user);
            if (!resultIssueAccessToken.getLeft().equals(ErrorIssueJWT.NONE)) {
                if (isDevelopment)
                    logger.info(ErrorIssueJWT.FAILED_TO_ISSUE.toString());
                return Pair.of(ErrorIssueJWT.FAILED_TO_ISSUE, Pair.of("", ""));
            }

            var resultIssueRefreshToken = issueRefreshToken(user);
            if (!resultIssueRefreshToken.getLeft().equals(ErrorIssueJWT.NONE)) {
                if (isDevelopment)
                    logger.info(ErrorIssueJWT.FAILED_TO_ISSUE.toString());
                return Pair.of(ErrorIssueJWT.FAILED_TO_ISSUE, Pair.of("", ""));
            }

            return Pair.of(ErrorIssueJWT.NONE, Pair.of(resultIssueAccessToken.getRight(), resultIssueRefreshToken.getRight()));
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return Pair.of(ErrorIssueJWT.FAILED_TO_ISSUE, Pair.of("", ""));
        }
    }

    public Pair<ErrorVerifyJWT, Optional<AuthedJwt>> decodeToken(String token) {
        try {
            var decodedToken = JWT.decode(token);
            return Pair.of(ErrorVerifyJWT.NONE, Optional.of(new AuthedJwt(decodedToken)));
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            if (isDevelopment)
                logger.info(ErrorVerifyJWT.FAILED_TO_DECODE.toString());
            return Pair.of(ErrorVerifyJWT.FAILED_TO_DECODE, Optional.empty());
        }
    }

    public Pair<ErrorVerifyJWT, Optional<AuthedJwt>> verifyToken(String token) {
        try {
            var algorithm = Algorithm.HMAC512(secretKey);
            var verifier = JWT.require(algorithm).withIssuer(validIssuer).build();
            var verifiedToken = verifier.verify(token);
            var optAuthedJwt = Optional.of(new AuthedJwt(verifiedToken));

            if (optAuthedJwt.get().getJwtId().isEmpty()) {
                if (isDevelopment)
                    logger.info(ErrorVerifyJWT.NOT_FOUND_TOKEN_ID.toString());
                return Pair.of(ErrorVerifyJWT.NOT_FOUND_TOKEN_ID, optAuthedJwt);
            }

            if (TokenType.NONE.equals(optAuthedJwt.get().getTokenType())) {
                if (isDevelopment)
                    logger.info(ErrorVerifyJWT.INVALID_TOKEN_TYPE.toString());
                return Pair.of(ErrorVerifyJWT.INVALID_TOKEN_TYPE, optAuthedJwt);
            }

            if (optAuthedJwt.get().getUserId().isEmpty()) {
                if (isDevelopment)
                    logger.info(ErrorVerifyJWT.NOT_FOUND_USER_ID.toString());
                return Pair.of(ErrorVerifyJWT.NOT_FOUND_USER_ID, optAuthedJwt);
            }

            if (AccountType.NONE.equals(optAuthedJwt.get().getAccountType())) {
                if (isDevelopment)
                    logger.info(ErrorVerifyJWT.NOT_FOUND_USER_ACCOUNT_TYPE.toString());
                return Pair.of(ErrorVerifyJWT.NOT_FOUND_USER_ACCOUNT_TYPE, optAuthedJwt);
            }

            if (disposedTokenRepository.existsById(optAuthedJwt.get().getJwtId())) {
                if (isDevelopment)
                    logger.info(ErrorVerifyJWT.DISPOSED_TOKEN.toString());
                return Pair.of(ErrorVerifyJWT.DISPOSED_TOKEN, optAuthedJwt);
            }

            return Pair.of(ErrorVerifyJWT.NONE, optAuthedJwt);
        } catch (TokenExpiredException ex) {
            if (isDevelopment)
                logger.info(ErrorVerifyJWT.TOKEN_EXPIRED.toString());

            // 기간이 만료된 토큰의 정보를 확인하기 위해 단순 디코드하여 반환한다.
            var decodedResult = decodeToken(token);
            return Pair.of(ErrorVerifyJWT.TOKEN_EXPIRED, decodedResult.getRight());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            if (isDevelopment)
                logger.info(ErrorVerifyJWT.FAILED_TO_DECODE.toString());
            return Pair.of(ErrorVerifyJWT.FAILED_TO_DECODE, Optional.empty());
        }
    }

    public Pair<ErrorVerifyJWT, Optional<AuthedJwt>> verifyAccessToken(String token) {
        try {
            if (token.isEmpty())
                return Pair.of(ErrorVerifyJWT.TOKEN_IS_EMPTY, Optional.empty());

            var verifiedResult = verifyToken(token);
            if (!verifiedResult.getLeft().equals(ErrorVerifyJWT.NONE) || verifiedResult.getRight().isEmpty()) {
                if (isDevelopment)
                    logger.info(ErrorVerifyJWT.FAILED_TO_DECODE.toString());
                return Pair.of(ErrorVerifyJWT.FAILED_TO_DECODE, verifiedResult.getRight());
            }

            if (!verifiedResult.getRight().get().getTokenType().equals(TokenType.ACCESS)) {
                if (isDevelopment)
                    logger.info(ErrorVerifyJWT.INVALID_TOKEN_TYPE.toString());
                return Pair.of(ErrorVerifyJWT.INVALID_TOKEN_TYPE, Optional.empty());
            }

            return verifiedResult;
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            if (isDevelopment)
                logger.info(ErrorVerifyJWT.FAILED_TO_DECODE.toString());
            return Pair.of(ErrorVerifyJWT.FAILED_TO_DECODE, Optional.empty());
        }
    }

    public Pair<ErrorVerifyJWT, Optional<AuthedJwt>> verifyRefreshToken(String token) {
        try {
            var verifiedResult = verifyToken(token);
            if (!verifiedResult.getLeft().equals(ErrorVerifyJWT.NONE) || verifiedResult.getRight().isEmpty())
                return Pair.of(ErrorVerifyJWT.FAILED_TO_DECODE, verifiedResult.getRight());

            if (!verifiedResult.getRight().get().getTokenType().equals(TokenType.REFRESH)) {
                if (isDevelopment)
                    logger.info(ErrorVerifyJWT.INVALID_TOKEN_TYPE.toString());
                return Pair.of(ErrorVerifyJWT.INVALID_TOKEN_TYPE, Optional.empty());
            }

            return verifiedResult;
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            if (isDevelopment)
                logger.info(ErrorVerifyJWT.FAILED_TO_DECODE.toString());
            return Pair.of(ErrorVerifyJWT.FAILED_TO_DECODE, Optional.empty());
        }
    }

    public Optional<DisposedToken> disposeToken(AuthedJwt authedJwt) {
        var disposedToken = new DisposedToken(authedJwt.getJwtId());
        var result = disposedTokenRepository.save(disposedToken);
        return Optional.of(result);
    }

    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer"))
            return bearerToken.substring(7);

        return "";
    }

    public Optional<Authentication> getAuthentication(String accessToken) {
        try {
            var resultVerified = verifyAccessToken(accessToken);
            if (ErrorVerifyJWT.NONE.equals(resultVerified.getLeft()) && resultVerified.getRight().isPresent()) {
                var authedUser = resultVerified.getRight().get();
                var user = new User(authedUser.getAccountType(), authedUser.getUserName(), authedUser.getName(), authedUser.getNickName());
                return Optional.of(new UsernamePasswordAuthenticationToken(user, "", user.getAuthorities()));
            } else {
                return Optional.empty();
            }
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return Optional.empty();
        }
    }

}
