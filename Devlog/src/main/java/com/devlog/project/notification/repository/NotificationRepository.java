package com.devlog.project.notification.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.devlog.project.notification.NotiEnums.NotiType;
import com.devlog.project.notification.entity.NotificationEntity;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
	
	
	// 안 읽은 메세지 개수 조회
	@Query("""
			select count(no)
			from NotificationEntity no
			where no.receiver.memberNo = :memberNo
			and no.isRead = 'N'
			
			""")
	Long countUnreadCount(Long memberNo);
	
	

	@Query("""
			select no
			from NotificationEntity no
			where no.receiver.memberNo = :memberNo
			order by no.notificationNo desc
			""")
	List<NotificationEntity> findAllNotiList(Long memberNo);


	
	@Query("""
			select no
			from NotificationEntity no
			where no.receiver.memberNo = :memberNo
			and no.type = :notiType
			order by no.notificationNo desc
			""")
	List<NotificationEntity> findOptionNotiList(Long memberNo, NotiType notiType);
	
}
