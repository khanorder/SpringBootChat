package com.zangho.game.server.service;

import com.zangho.game.server.domain.Visit;
import com.zangho.game.server.repository.VisitRepository;

public class VisitService {

    private final VisitRepository visitRepository;

    public VisitService(VisitRepository visitRepository) {
        this.visitRepository = visitRepository;
    }

    public boolean saveVisit(Visit visit) {
        return visitRepository.save(visit);
    }

}
