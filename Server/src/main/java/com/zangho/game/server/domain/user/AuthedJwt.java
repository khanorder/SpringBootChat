package com.zangho.game.server.domain.user;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.zangho.game.server.define.AccountType;
import com.zangho.game.server.define.TokenType;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@Data
public class AuthedJwt {
    String issuer;
    String subject;
    List<String> audience;
    Date expiresAt;
    Date notBeforeAt;
    Date issuedAt;
    String jwtId;
    String userId;
    TokenType tokenType;
    AccountType accountType;
    String userName;
    String name;
    String nickName;

    Logger logger = LoggerFactory.getLogger(AuthedJwt.class);
    
    public AuthedJwt (DecodedJWT decodedJWT) {
        try {
            this.issuer = decodedJWT.getIssuer();
            this.subject = decodedJWT.getSubject();
            this.audience = decodedJWT.getAudience();
            this.expiresAt = decodedJWT.getExpiresAt();
            this.issuedAt = decodedJWT.getIssuedAt();
            this.jwtId = null != decodedJWT.getId() && !decodedJWT.getId().isEmpty() ? decodedJWT.getId() : "";

            Optional<TokenType> optTokenType = Optional.empty();
            if (!decodedJWT.getClaim("tkt").isMissing() && !decodedJWT.getClaim("tkt").isNull())
                optTokenType = TokenType.getType(decodedJWT.getClaim("tkt").asInt());

            this.tokenType = optTokenType.orElse(TokenType.NONE);
            switch (this.tokenType) {
                case NONE:
                    this.userId = "";
                    this.accountType = AccountType.NONE;
                    this.userName = "";
                    this.name = "";
                    this.nickName = "";
                    return;

                case ACCESS:
                    this.userName = decodedJWT.getClaim("userName").isMissing() || decodedJWT.getClaim("userName").isNull() ? "" : decodedJWT.getClaim("userName").asString();
                    this.name = decodedJWT.getClaim("name").isMissing() || decodedJWT.getClaim("name").isNull() ? "" : decodedJWT.getClaim("name").asString();
                    this.nickName = decodedJWT.getClaim("nickName").isMissing() || decodedJWT.getClaim("nickName").isNull() ? "" : decodedJWT.getClaim("nickName").asString();
                    break;
            }

            this.userId = decodedJWT.getClaim("id").isMissing() || decodedJWT.getClaim("id").isNull() ? "" : decodedJWT.getClaim("id").asString();

            Optional<AccountType> optAccountType = Optional.empty();
            if (!decodedJWT.getClaim("accountType").isMissing() && !decodedJWT.getClaim("accountType").isNull())
                optAccountType = AccountType.getType(decodedJWT.getClaim("accountType").asInt());

            this.accountType = optAccountType.orElse(AccountType.NONE);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);

            this.issuer = "";
            this.subject = "";
            this.audience = new ArrayList<>();
            this.expiresAt = new Date();
            this.issuedAt = new Date();
            this.jwtId = "";
            this.tokenType = TokenType.NONE;
            this.userId = "";
            this.accountType = AccountType.NONE;
        }
    }
}
