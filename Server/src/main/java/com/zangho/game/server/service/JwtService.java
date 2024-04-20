package com.zangho.game.server.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.zangho.game.server.define.AccountType;
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

    @Value("${jwt.expire_minutes:}")
    private int expireMinutes;

    public JwtService(DisposedTokenRepository disposedTokenRepository) {
        this.disposedTokenRepository = disposedTokenRepository;
    }

    public Pair<ErrorIssueJWT, String> issueToken(User user) {
        try {
            var algorithm = Algorithm.HMAC512(secretKey);
            var now = new Date();
            var cal = Calendar.getInstance();
            cal.setTime(now);
            cal.add(Calendar.MINUTE, user.getAccountType().equals(AccountType.TEMP) ? 5 : expireMinutes);
            var expire = new Date(cal.getTimeInMillis());
            var jti = UUID.randomUUID().toString();

            var token = JWT.create()
                .withJWTId(jti)
                .withIssuer(validIssuer)
                .withAudience(validAudiences)
                .withNotBefore(now)
                .withIssuedAt(now)
                .withExpiresAt(expire)
                .withClaim("id", user.getId())
                .withClaim("accountType", user.getAccountType().getNumber())
                .withClaim("haveProfile", user.getHaveProfile())
                .withClaim("latestActiveAt", user.getLatestActiveAt().getTime())
                .withClaim("name", user.getName())
                .withClaim("message", user.getMessage())
                .sign(algorithm);

            return Pair.of(ErrorIssueJWT.NONE, token);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return Pair.of(ErrorIssueJWT.FAILED_TO_ISSUE, "");
        }
    }

    public Pair<ErrorDeserializeJWT, Optional<DecodedJWT>> deserializeToken(String token) {
        try {
            var algorithm = Algorithm.HMAC512(secretKey);
            var verifier = JWT.require(algorithm).withIssuer(validIssuer).build();
            var deserializedToken = verifier.verify(token);
            if (null == deserializedToken.getId())
                return Pair.of(ErrorDeserializeJWT.NOT_FOUND_TOKEN_ID, Optional.empty());

            return Pair.of(ErrorDeserializeJWT.NONE, Optional.of(deserializedToken));
        } catch (TokenExpiredException ex) {
            return Pair.of(ErrorDeserializeJWT.TOKEN_EXPIRED, Optional.empty());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return Pair.of(ErrorDeserializeJWT.FAILED_TO_DESERIALIZE, Optional.empty());
        }
    }



}
