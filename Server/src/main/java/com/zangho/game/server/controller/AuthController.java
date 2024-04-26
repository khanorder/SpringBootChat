package com.zangho.game.server.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zangho.game.server.define.AccountType;
import com.zangho.game.server.domain.request.ReqSignIn;
import com.zangho.game.server.domain.request.ReqSignUp;
import com.zangho.game.server.domain.response.ResSignIn;
import com.zangho.game.server.domain.response.ResSignUp;
import com.zangho.game.server.error.ErrorIssueJWT;
import com.zangho.game.server.error.ErrorSignIn;
import com.zangho.game.server.error.ErrorSignUp;
import com.zangho.game.server.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;

@Controller
public class AuthController {

    private final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final boolean isDevelopment;
    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    public AuthController(UserService userService, JwtService jwtService, PasswordEncoder passwordEncoder) {
        var config = System.getProperty("Config");
        isDevelopment = null == config || !config.equals("production");
        this.userService = userService;
        this.jwtService = jwtService;
        this.objectMapper = new ObjectMapper();
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping(value = "/auth/signIn", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String signUp(@RequestBody ReqSignIn reqSignIn) throws Exception {
        var response = new ResSignIn();
        response.setResult(ErrorSignIn.FAILED_TO_SIGN_IN);

        var userName = reqSignIn.getUserName().trim();
        var password = reqSignIn.getPassword().trim();

        if (userName.isEmpty()) {
            response.setResult(ErrorSignIn.USER_NAME_REQUIRED);
            return objectMapper.writeValueAsString(response);
        }

        if (password.isEmpty()) {
            response.setResult(ErrorSignIn.USER_NAME_REQUIRED);
            return objectMapper.writeValueAsString(response);
        }

        var optUser = userService.findByUserName(userName);
        if (optUser.isEmpty()) {
            if (isDevelopment)
                logger.info("SignIn : Not Found User '" + userName + "'.");

            return objectMapper.writeValueAsString(response);
        }

        if (!AccountType.NORMAL.equals(optUser.get().getAccountType())) {
            if (isDevelopment)
                logger.info("SignIn : '" + userName + "' account is not normal type.");

            return objectMapper.writeValueAsString(response);
        }

        if (!passwordEncoder.matches(password, optUser.get().getPassword())) {
            if (isDevelopment)
                logger.info("SignIn : '" + userName + "' password was wrong.");

            return objectMapper.writeValueAsString(response);
        }

        if (userService.isConnectedUser(optUser.get())) {
            if (isDevelopment)
                logger.info("SignIn : Already Sign in User '" + userName + "'.");

            response.setResult(ErrorSignIn.ALREADY_SIGN_IN);
            return objectMapper.writeValueAsString(response);
        }

        var resultIssueToken = jwtService.issueAccessTokenWithRefresh(optUser.get());
        if (!ErrorIssueJWT.NONE.equals(resultIssueToken.getLeft()) || resultIssueToken.getRight().getLeft().isEmpty() || resultIssueToken.getRight().getRight().isEmpty()) {
            if (isDevelopment)
                logger.info("SignIn : '" + userName + "' failed to issue token.");

            return objectMapper.writeValueAsString(response);
        }

        response.setResult(ErrorSignIn.NONE);
        response.setAccessToken(resultIssueToken.getRight().getLeft());
        response.setRefreshToken(resultIssueToken.getRight().getRight());

        return objectMapper.writeValueAsString(response);
    }

    @PostMapping(value = "/auth/signUp", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String signUp(@RequestBody ReqSignUp reqSignUp) throws Exception {
        var response = new ResSignUp();
        response.setResult(ErrorSignUp.FAILED_TO_SIGN_UP);

        var userName = reqSignUp.getUserName().trim();
        var password = reqSignUp.getPassword().trim();
        var token = reqSignUp.getToken().trim();

        if (userName.isEmpty()) {
            response.setResult(ErrorSignUp.USER_NAME_REQUIRED);
            return objectMapper.writeValueAsString(response);
        }

        if (2 > userName.length()) {
            response.setResult(ErrorSignUp.USER_NAME_MORE_THAN_TWO);
            return objectMapper.writeValueAsString(response);
        }

        if (password.isEmpty()) {
            response.setResult(ErrorSignUp.USER_NAME_REQUIRED);
            return objectMapper.writeValueAsString(response);
        }

        if (4 > password.length()) {
            response.setResult(ErrorSignUp.PASSWORD_MORE_THAN_FOUR);
            return objectMapper.writeValueAsString(response);
        }

        var optUserByUserName = userService.findByUserName(userName);
        if (optUserByUserName.isPresent()) {
            response.setResult(ErrorSignUp.ALREADY_USED_USER_NAME);
            return objectMapper.writeValueAsString(response);
        }

        if (!token.isEmpty()) {
            var resultVerified = jwtService.verifyAccessToken(token);
            switch (resultVerified.getLeft()) {
                case NONE:
                    var tokenUser = resultVerified.getRight();
                    if (tokenUser.isEmpty()) {
                        response.setResult(ErrorSignUp.NOT_VALID_TOKEN_USER);
                        return objectMapper.writeValueAsString(response);
                    }

                    if (!AccountType.TEMP.equals(tokenUser.get().getAccountType())) {
                        response.setResult(ErrorSignUp.NOT_VALID_ACCOUNT_TYPE);
                        return objectMapper.writeValueAsString(response);
                    }

                    var optUserByToken = userService.findUserById(tokenUser.get().getUserId());
                    if (optUserByToken.isEmpty() || !AccountType.TEMP.equals(optUserByToken.get().getAccountType())) {
                        response.setResult(ErrorSignUp.NOT_FOUND_TEMP_USER);
                        return objectMapper.writeValueAsString(response);
                    }

                    if (userService.upgradeUserAccount(optUserByToken.get().getId(), userName, passwordEncoder.encode(password))) {
                        jwtService.disposeToken(tokenUser.get());

                        var resultIssueToken = jwtService.issueAccessTokenWithRefresh(optUserByToken.get());
                        if (ErrorIssueJWT.NONE != resultIssueToken.getLeft() || resultIssueToken.getRight().getLeft().isEmpty() || resultIssueToken.getRight().getRight().isEmpty()) {
                            response.setResult(ErrorSignUp.FAILED_TO_ISSUE_TOKEN);
                            return objectMapper.writeValueAsString(response);
                        }

                        response.setResult(ErrorSignUp.UPGRADE_EXISTS_ACCOUNT);
                        response.setAccessToken(resultIssueToken.getRight().getLeft());
                        response.setRefreshToken(resultIssueToken.getRight().getRight());
                        return objectMapper.writeValueAsString(response);
                    }

                default:
                    response.setResult(ErrorSignUp.NOT_VALID_ACCESS_TOKEN);
                    return objectMapper.writeValueAsString(response);
            }
        }

        if (userService.createNewUserAccount(userName, passwordEncoder.encode(password))) {
            response.setResult(ErrorSignUp.NONE);
            return objectMapper.writeValueAsString(response);
        }

        return objectMapper.writeValueAsString(response);
    }
}
