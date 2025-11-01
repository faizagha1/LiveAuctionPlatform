package com.liveauction.auction.service;

import com.liveauction.auction.entity.AuctionEntity;
import com.liveauction.auction.repository.AuctionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionScheduledService {
    
    private final AuctionRepository auctionRepository;

    /**
     * Check every 60 seconds for auctions that should start
     * SCHEDULED → ONGOING when startTime <= now
     */
    @Scheduled(fixedRate = 60000) // Every 60 seconds
    @Transactional
    public void startAuctions() {
        log.debug("Checking for auctions to start...");
        
        Instant now = Instant.now();
        List<AuctionEntity> auctionsToStart = auctionRepository
                .findAllByStatusAndStartTimeLessThanEqual(AuctionEntity.AuctionStatus.SCHEDULED, now);
        
        if (auctionsToStart.isEmpty()) {
            log.debug("No auctions to start");
            return;
        }
        
        for (AuctionEntity auction : auctionsToStart) {
            auction.setStatus(AuctionEntity.AuctionStatus.ONGOING);
            auctionRepository.save(auction);
            log.info("✅ Auction STARTED: {} (ID: {})", auction.getTitle(), auction.getId());

            // TODO: Publish an 'AuctionStartedEvent' to notify the Bidding Service
            // e.g., auctionEventProducer.publishAuctionStarted(new AuctionStartedEvent(...));
        }
        
        log.info("Started {} auctions", auctionsToStart.size());
    }

    /**
     * Check every 60 seconds for auctions that should end
     * ONGOING → COMPLETED when endTime <= now
     */
    @Scheduled(fixedRate = 60000) // Every 60 seconds
    @Transactional
    public void endAuctions() {
        log.debug("Checking for auctions to end...");
        
        Instant now = Instant.now();
        List<AuctionEntity> auctionsToEnd = auctionRepository
                .findAllByStatusAndEndTimeLessThanEqual(AuctionEntity.AuctionStatus.ONGOING, now);
        
        if (auctionsToEnd.isEmpty()) {
            log.debug("No auctions to end");
            return;
        }
        
        for (AuctionEntity auction : auctionsToEnd) {
            auction.setStatus(AuctionEntity.AuctionStatus.COMPLETED);
            auctionRepository.save(auction);
            log.info("🏁 Auction ENDED: {} (ID: {})", auction.getTitle(), auction.getId());
            
            // TODO: Publish an 'AuctionEndedEvent'
            // This event should trigger winner determination, payment processing, etc.
            // e.g., auctionEventProducer.publishAuctionEnded(new AuctionEndedEvent(...));
        }
        
        log.info("Ended {} auctions", auctionsToEnd.size());
    }
}