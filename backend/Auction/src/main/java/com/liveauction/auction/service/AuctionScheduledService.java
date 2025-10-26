package com.liveauction.auction.service;

import com.liveauction.auction.entity.AuctionEntity;
import com.liveauction.auction.event.producer.AuctionCreatedEventProducer;
import com.liveauction.auction.repository.AuctionRepository;
import com.liveauction.shared.events.AuctionEvents.AuctionCreatedEvent;
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
    private final AuctionCreatedEventProducer auctionCreatedEventProducer;

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

            AuctionCreatedEvent event = new AuctionCreatedEvent(
                    auction.getId().toString(),
                    auction.getItemId().toString(),
                    auction.getAuctioneerId().toString(),
                    auction.getStartingPrice() != null ? auction.getStartingPrice().doubleValue() : 0.0,
                    auction.getReservePrice() != null ? auction.getReservePrice().doubleValue() : 0.0,
                    auction.getBidIncrement() != null ? auction.getBidIncrement().doubleValue() : 0.0,
                    auction.getStartTime(),
                    auction.getEndTime()
            );
            auctionCreatedEventProducer.auctionCreated(event);
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
            
            // TODO V2: Winner determination will be done by Go Bidding Engine
        }
        
        log.info("Ended {} auctions", auctionsToEnd.size());
    }
}
