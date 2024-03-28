package com.zangho.game.server.service;

import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.repository.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

public class UserService {

    private final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> createNewUser() throws Exception {
        var count = userRepository.count();
        var newUser = new User("user-" + (count + 1));
        var result = userRepository.save(newUser);
        return Optional.ofNullable(result);
    }

    public Optional<User> findUser(String id) throws Exception {
        return userRepository.findById(id);
    }

    public boolean updateUser(User user) throws Exception {
        var existsUser = userRepository.save(user);
        return null != existsUser;
    }

}
