package com.zangho.game.server.service;

import com.zangho.game.server.domain.request.ReqVisit;
import com.zangho.game.server.repository.visit.VisitRepository;

public class VisitService {

    private final VisitRepository visitRepository;

    public VisitService(VisitRepository visitRepository) {
        this.visitRepository = visitRepository;
    }

    public boolean saveVisit(ReqVisit reqVisit) {
        return visitRepository.save(reqVisit);
    }

}
