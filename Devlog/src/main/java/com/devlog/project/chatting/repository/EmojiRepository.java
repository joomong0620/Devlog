package com.devlog.project.chatting.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.devlog.project.chatting.dto.EmojiDTO;
import com.devlog.project.chatting.entity.MessageEmoji;

@Repository
public interface EmojiRepository extends JpaRepository<MessageEmoji, Long> {
	
	
	
	// jpql * 없음 그룹바이 , 로 구분
	@Query("""
			select new com.devlog.project.chatting.dto.EmojiDTO(
			me.message.messageNo,
			me.emoji.emoji,
			count(me))
			from MessageEmoji me
			where me.message.messageNo in :messageNos
			group by me.message.messageNo, me.emoji.emoji
			
			
			
			""")
	List<EmojiDTO> findEmojiCount(@Param("messageNos") List<Long> messageNos);
	
	

}
