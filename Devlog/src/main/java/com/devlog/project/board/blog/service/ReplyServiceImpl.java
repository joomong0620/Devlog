package com.devlog.project.board.blog.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.devlog.project.board.blog.dto.ReplyDto;
import com.devlog.project.board.blog.mapper.ReplyMapper;
import com.devlog.project.pay.dto.PayDTO;
import com.devlog.project.pay.mapper.PayMapper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReplyServiceImpl implements ReplyService{
	
	private final ReplyMapper replyMapper;  // 댓글, 구매 내역
	private final PayMapper payMapper;		// 지갑 잔액
	
	// 댓글 로직
	@Override
    public List<ReplyDto> getComments(Long boardNo) {
        List<ReplyDto> all = replyMapper.selectReplyList(boardNo);
        List<ReplyDto> result = new ArrayList<>();
        Map<Long, ReplyDto> map = new HashMap<>();

        for (ReplyDto dto : all) {
            map.put(dto.getCommentNo(), dto);
            dto.setChildren(new ArrayList<>());
        }

        for (ReplyDto dto : all) {
            if (dto.getParentCommentNo() == null) {
                result.add(dto);
            } else {
                ReplyDto parent = map.get(dto.getParentCommentNo());
                if (parent != null) parent.getChildren().add(dto);
                else result.add(dto);
            }
        }
        return result;
    }
	
	@Override
    public int writeComment(ReplyDto reply) { 
		return replyMapper.insertReply(reply); 
	}
	
    @Override
    public int deleteComment(Long commentNo) {
    	return replyMapper.deleteReply(commentNo); 
    }
    
    @Override
    public int updateComment(ReplyDto reply) {
    	return replyMapper.updateReply(reply); 
    }
    
    // 결제 로직 
    @Override
    @Transactional
    public void purchasePost(Long postId, Long memberNo, int amount) {
        
        // 1. 이미 샀는지 확인 (내 구매 내역)
        if (replyMapper.checkPurchaseHistory(postId, memberNo) > 0) {
            throw new RuntimeException("이미 구매한 게시글입니다.");
        }

        // 2. 잔액 확인
        PayDTO myBeans = payMapper.selectMyBeans(memberNo);
        if (myBeans == null || myBeans.getBeansAmount() < amount) {
            throw new RuntimeException("잔액이 부족합니다.");
        }

        // 3. 구매자 보유 커피콩 차감
        PayDTO deduction = new PayDTO();
        deduction.setMemberNo(memberNo);
        deduction.setPrice(-amount); // 음수 = 차감
        payMapper.updateMemberBeans(deduction);

        // 4. 구매 내역 저장
        replyMapper.insertPurchaseHistory(postId, memberNo, amount);

        // 5. 판매자에게 커피콩 지급
        Long writerNo = replyMapper.selectBoardWriter(postId);
        if (!writerNo.equals(memberNo)) {
            PayDTO addition = new PayDTO();
            addition.setMemberNo(writerNo);
            addition.setPrice(amount); // 양수 = 증가
            payMapper.updateMemberBeans(addition);
        }
    }
    
    @Override
    public boolean isPurchased(Long postId, Long memberNo) {
        return replyMapper.checkPurchaseHistory(postId, memberNo) > 0;
    }
    
    
}
