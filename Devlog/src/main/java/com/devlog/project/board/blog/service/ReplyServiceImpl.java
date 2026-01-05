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
    public List<ReplyDto> getComments(Long boardNo, Long memberNo) {
        Map<String, Object> params = new HashMap<>();
        params.put("boardNo", boardNo);
        
        // 로그인 안 했으면 null 들어감 (MyBatis XML에서 <if>로 처리)
        params.put("memberNo", memberNo); 
        
        // Mapper 호출 (Mapper 인터페이스 파라미터도 Map으로 바꿨는지 확인 필수!)
        List<ReplyDto> all = replyMapper.selectReplyList(params);
        
        // --- 아래는 기존 계층형 변환 로직 유지 ---
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
	
	// 댓글 작성
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
    
    // 댓글 좋아요 토글
    @Override
    @Transactional
    public boolean toggleCommentLike(Long commentNo, Long memberNo) {
        // 1. 이미 좋아요 했는지 확인
        int count = replyMapper.checkCommentLike(commentNo, memberNo);
        
        if (count > 0) {
            // 이미 했으면 -> 취소 (삭제)
            replyMapper.deleteCommentLike(commentNo, memberNo);
            return false; // 결과: 좋아요 안 함
        } else {
            // 안 했으면 -> 등록 (추가)
            replyMapper.insertCommentLike(commentNo, memberNo);
            return true; // 결과: 좋아요 함
        }
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
