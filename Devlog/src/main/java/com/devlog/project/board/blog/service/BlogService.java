package com.devlog.project.board.blog.service;

import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

import com.devlog.project.board.blog.dto.BlogDTO;
import com.devlog.project.board.blog.dto.MyBlogResponseDto;
import com.devlog.project.board.blog.dto.UserProfileDto;
import com.devlog.project.member.model.entity.Member;

public interface BlogService {

	// 전체 목록 조회
	Map<String, Object> getBlogList(int page, int size, String sort);

	// 내 블로그 목록 조회
	Map<String, Object> getMyBlogList(String blogId, String type, int page, int size, String sort);

	// 글 작성
	Long writeBlog(BlogDTO blogDTO);

	// 이미지 업로드
	String uploadImage(MultipartFile image);
	
	// 프로필 조회
	UserProfileDto getUserProfile(String blogId);
	
	// 내 블로그 화면용 전체 데이터 조회
	MyBlogResponseDto getMyBlogPageData(String blogId, String currentLoginId);
	
	// 상세 게시글 조회
	BlogDTO getBoardDetail(Long boardNo);
	
	// 조회수 증가
    void increaseViewCount(Long boardNo);
    
    // 게시글 삭제
    void deletePost(Long boardNo);
	
	boolean toggleFollow(Long followerId, Long targetId);
    boolean isFollowing(Long followerId, Long targetId);
    void increaseVisitCount(Long blogOwnerNo);
    
    boolean toggleBoardLike(Long boardNo, Long memberNo);
    
    // 팔로워, 팔로잉 목록 조회
	List<UserProfileDto> getFollowList(String blogId, String string, Member me);

	// 게시글 수정
	void updateBlog(BlogDTO blogDTO);
	
	
	
}