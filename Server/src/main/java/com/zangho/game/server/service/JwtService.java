package com.zangho.game.server.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.zangho.game.server.define.AccountType;
import com.zangho.game.server.define.TokenType;
import com.zangho.game.server.domain.user.DisposedToken;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.error.ErrorDeserializeJWT;
import com.zangho.game.server.error.ErrorIssueJWT;
import com.zangho.game.server.repository.user.DisposedTokenRepository;
import org.apache.commons.lang3.tuple.Pair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import java.util.Calendar;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

public class JwtService {

    private Logger logger = LoggerFactory.getLogger(JwtService.class);

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
        this.disposedTokenRepository = disposedTokenRepository;
    }

    public Pair<ErrorIssueJWT, Pair<String, String>> issueAccessToken(User user) {
        try {
            var algorithm = Algorithm.HMAC512(secretKey);
            var now = new Date();
            var cal = Calendar.getInstance();
            cal.setTime(now);
            cal.add(Calendar.MINUTE, user.getAccountType().equals(AccountType.TEMP) ? 5 : accessExpireMinutes);
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
                .sign(algorithm);

            var resultIssueRefreshToken = issueRefreshToken(user);
            if (!resultIssueRefreshToken.getLeft().equals(ErrorIssueJWT.NONE))
                return Pair.of(ErrorIssueJWT.FAILED_TO_ISSUE, Pair.of("", ""));

            return Pair.of(ErrorIssueJWT.NONE, Pair.of(token, resultIssueRefreshToken.getRight()));
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return Pair.of(ErrorIssueJWT.FAILED_TO_ISSUE, Pair.of("", ""));
        }
    }

    public Pair<ErrorDeserializeJWT, Optional<DecodedJWT>> deserializeAccessToken(String token) {
        try {
            var algorithm = Algorithm.HMAC512(secretKey);
            var verifier = JWT.require(algorithm).withIssuer(validIssuer).build();
            var deserializedToken = verifier.verify(token);
            if (null == deserializedToken.getId())
                return Pair.of(ErrorDeserializeJWT.NOT_FOUND_TOKEN_ID, Optional.empty());

            if (deserializedToken.getClaim("tkt").isMissing() || !deserializedToken.getClaim("tkt").asInt().equals(TokenType.ACCESS.getNumber()))
                return Pair.of(ErrorDeserializeJWT.INVALID_TOKEN_TYPE, Optional.empty());

            if (deserializedToken.getClaim("id").isMissing())
                return Pair.of(ErrorDeserializeJWT.NOT_FOUND_USER_ID, Optional.empty());

            if (deserializedToken.getClaim("accountType").isMissing())
                return Pair.of(ErrorDeserializeJWT.NOT_FOUND_USER_ACCOUNT_TYPE, Optional.empty());

            var accountTypeInt = deserializedToken.getClaim("accountType").asInt();
            var optAccountType = AccountType.getType(accountTypeInt);
            if (optAccountType.isEmpty())
                return Pair.of(ErrorDeserializeJWT.NOT_FOUND_USER_ACCOUNT_TYPE, Optional.empty());

            if (disposedTokenRepository.existsById(deserializedToken.getId()))
                return Pair.of(ErrorDeserializeJWT.DISPOSED_TOKEN, Optional.empty());

            return Pair.of(ErrorDeserializeJWT.NONE, Optional.of(deserializedToken));
        } catch (TokenExpiredException ex) {
            return Pair.of(ErrorDeserializeJWT.TOKEN_EXPIRED, Optional.empty());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return Pair.of(ErrorDeserializeJWT.FAILED_TO_DESERIALIZE, Optional.empty());
        }
    }

    public Pair<ErrorIssueJWT, String> issueRefreshToken(User user) {
        try {
            var algorithm = Algorithm.HMAC512(secretKey);
            var now = new Date();
            var cal = Calendar.getInstance();
            cal.setTime(now);
            cal.add(Calendar.DATE, user.getAccountType().equals(AccountType.TEMP) ? 5 : refreshExpireDay);
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

    public Pair<ErrorDeserializeJWT, Optional<DecodedJWT>> deserializeRefreshToken(String token) {
        try {
            var algorithm = Algorithm.HMAC512(secretKey);
            var verifier = JWT.require(algorithm).withIssuer(validIssuer).build();
            var deserializedToken = verifier.verify(token);
            if (null == deserializedToken.getId())
                return Pair.of(ErrorDeserializeJWT.NOT_FOUND_TOKEN_ID, Optional.empty());

            if (deserializedToken.getClaim("tkt").isMissing() || !deserializedToken.getClaim("tkt").asInt().equals(TokenType.REFRESH.getNumber()))
                return Pair.of(ErrorDeserializeJWT.INVALID_TOKEN_TYPE, Optional.empty());

            if (deserializedToken.getClaim("id").isMissing())
                return Pair.of(ErrorDeserializeJWT.NOT_FOUND_USER_ID, Optional.empty());

            if (deserializedToken.getClaim("accountType").isMissing())
                return Pair.of(ErrorDeserializeJWT.NOT_FOUND_USER_ACCOUNT_TYPE, Optional.empty());

            var accountTypeInt = deserializedToken.getClaim("accountType").asInt();
            var optAccountType = AccountType.getType(accountTypeInt);
            if (optAccountType.isEmpty())
                return Pair.of(ErrorDeserializeJWT.NOT_FOUND_USER_ACCOUNT_TYPE, Optional.empty());

            if (disposedTokenRepository.existsById(deserializedToken.getId()))
                return Pair.of(ErrorDeserializeJWT.DISPOSED_TOKEN, Optional.empty());

            return Pair.of(ErrorDeserializeJWT.NONE, Optional.of(deserializedToken));
        } catch (TokenExpiredException ex) {
            return Pair.of(ErrorDeserializeJWT.TOKEN_EXPIRED, Optional.empty());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return Pair.of(ErrorDeserializeJWT.FAILED_TO_DESERIALIZE, Optional.empty());
        }
    }

    public Optional<DisposedToken> disposeToken(DecodedJWT decodedJWT) {
        var disposedToken = new DisposedToken(decodedJWT.getId());
        var result = disposedTokenRepository.save(disposedToken);
        return Optional.of(result);
    }

}
