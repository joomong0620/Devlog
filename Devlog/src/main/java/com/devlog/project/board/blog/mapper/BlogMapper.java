package com.devlog.project.board.blog.mapper;

import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;

import com.devlog.project.board.blog.dto.BlogDTO;
import com.devlog.project.board.blog.dto.TagDto;

@Mapper
public interface BlogMapper {

    // 게시글 등록 (BOARD -> BLOG 순서)
    int insertBoard(BlogDTO blogDTO);
    int insertBlog(BlogDTO blogDTO);

    // 태그 등록 및 연결
    int insertTag(String tagName);
    Long selectTagNoByName(String tagName);
    int insertBlogTag(Map<String, Object> params);

    // 목록 조회 (페이징)
    List<BlogDTO> selectBlogList(Map<String, Object> params);
    int countBlogList(Map<String, Object> params);

    // 내 블로그 목록 (특정 유저)
    List<BlogDTO> selectMyBlogList(Map<String, Object> params);
    int countMyBlogList(Map<String, Object> params);

    // 상세 조회
    BlogDTO selectBlogDetail(Long boardNo);

    // 조회수 증가
    int updateViewCount(Long boardNo);
    
    // 유저 PICK 인기 글 조회
    BlogDTO selectPopularPost(String blogId);
    
    // 블로그 전체 태그 목록 조회
    List<TagDto> selectBlogTagList(String blogId);
    
    // 상세 게시글 전용 태그 조회
    List<String> selectBoardTags(Long boardNo);
}