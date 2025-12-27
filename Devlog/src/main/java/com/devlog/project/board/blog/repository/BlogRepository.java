package com.devlog.project.board.blog.repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.devlog.project.board.blog.entity.Blog;

public interface BlogRepository extends JpaRepository<Blog, Long>{

	// findAll(Pageable pageable) 메소드는 이미 내장되어 있어 별도 작성 불필요
}
