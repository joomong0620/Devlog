package com.devlog.project.board.blog.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.devlog.project.board.blog.entity.Blog;

public interface BlogRepository extends JpaRepository<Blog, Long> {

	// [중요] 특정 작성자(이메일)의 글만 페이징해서 가져오는 쿼리 메소드
	// SQL: SELECT * FROM BLOG WHERE AUTHOR_NAME = ?
	Page<Blog> findByAuthorName(String authorName, Pageable pageable);

}