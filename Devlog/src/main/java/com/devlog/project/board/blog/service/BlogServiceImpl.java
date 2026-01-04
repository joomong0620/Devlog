package com.devlog.project.board.blog.service;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.devlog.project.board.blog.dto.BlogDTO;
import com.devlog.project.board.blog.dto.MyBlogResponseDto; // [추가]
import com.devlog.project.board.blog.dto.TagDto;
import com.devlog.project.board.blog.dto.UserProfileDto;
import com.devlog.project.board.blog.mapper.BlogMapper;
import com.devlog.project.member.enums.CommonEnums;
import com.devlog.project.member.model.entity.Member;
import com.devlog.project.member.model.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BlogServiceImpl implements BlogService {

    private final BlogMapper blogMapper;
    private final MemberRepository memberRepository; 

    @Value("${my.blogWrite.location}")
    private String uploadLocation;

    @Value("${my.blogWrite.webpath}")
    private String uploadWebPath;
    
    // 블로그 페이지네이션
    @Override
    public Map<String, Object> getBlogList(int page, int size, String sort) {
        Map<String, Object> params = new HashMap<>();
        params.put("offset", page * size);
        params.put("limit", size);
        params.put("sort", sort);

        List<BlogDTO> list = blogMapper.selectBlogList(params);
        int totalCount = blogMapper.countBlogList(params);

        Map<String, Object> result = new HashMap<>();
        result.put("content", list);
        result.put("totalElements", totalCount);
        result.put("totalPages", (int) Math.ceil((double) totalCount / size));
        result.put("last", (page + 1) * size >= totalCount);
        
        return result;
    }
    
    // 블로그 게시글 글 작성
    @Override
    @Transactional
    public Long writeBlog(BlogDTO blogDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new AccessDeniedException("로그인이 필요합니다.");
        }
        String email = auth.getName();

        Member member = memberRepository.findByMemberEmailAndMemberDelFl(email, CommonEnums.Status.N)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보 없음"));

        blogDTO.setMemberNo(member.getMemberNo());

        blogMapper.insertBoard(blogDTO);
        blogMapper.insertBlog(blogDTO);

        if (blogDTO.getTagList() != null && !blogDTO.getTagList().isEmpty()) {
            for (String tagName : blogDTO.getTagList()) {
                blogMapper.insertTag(tagName);
                Long tagNo = blogMapper.selectTagNoByName(tagName);
                
                Map<String, Object> tagParams = new HashMap<>();
                tagParams.put("boardNo", blogDTO.getBoardNo());
                tagParams.put("tagNo", tagNo);
                blogMapper.insertBlogTag(tagParams);
            }
        }
        return blogDTO.getBoardNo();
    }

    // 목록 조회 구현
    @Override
    public Map<String, Object> getMyBlogList(String blogId, String type, int page, int size, String sort) {
        Map<String, Object> params = new HashMap<>();
        params.put("blogId", blogId);
        params.put("type", type); // [중요] XML로 type 전달
        params.put("offset", page * size);
        params.put("limit", size);
        params.put("sort", sort);

        List<BlogDTO> list = blogMapper.selectMyBlogList(params);
        int totalCount = blogMapper.countMyBlogList(params);

        Map<String, Object> result = new HashMap<>();
        result.put("content", list);
        result.put("totalElements", totalCount);
        result.put("totalPages", (int) Math.ceil((double) totalCount / size));
        result.put("last", (page + 1) * size >= totalCount);

        return result;
    }
    
    // 이미지 업로드
    @Override
    public String uploadImage(MultipartFile image) {
        if(image == null || image.isEmpty()) return null;
        
        String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
        File folder = new File(uploadLocation);
        if (!folder.exists()) folder.mkdirs();
        
        try {
            File saveFile = new File(uploadLocation, fileName);
            image.transferTo(saveFile);
            return uploadWebPath + fileName;
        } catch(IOException e) {
            throw new RuntimeException("이미지 업로드 실패", e);
        }
    }
    
    // 단순 프로필 조회
    @Override
    public UserProfileDto getUserProfile(String blogId) {
        Member member = memberRepository.findByMemberEmailAndMemberDelFl(blogId, CommonEnums.Status.N)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        UserProfileDto userProfileDto = new UserProfileDto();
        userProfileDto.setId(member.getMemberEmail());
        userProfileDto.setNickname(member.getMemberNickname());
        userProfileDto.setUsername(member.getMemberName());
        userProfileDto.setJob(member.getMemberCareer() != null ? member.getMemberCareer() : "개발자");
        userProfileDto.setBio(member.getMyInfoIntro() != null ? member.getMyInfoIntro() : "소개가 없습니다.");
        userProfileDto.setProfileImgUrl(member.getProfileImg());
        userProfileDto.setGithubUrl(member.getMyInfoGit());
        userProfileDto.setBlogUrl(member.getMyInfoHomepage());
        userProfileDto.setExp(member.getCurrentExp());

        return userProfileDto;
    }

    // 화면용 전체 데이터
    @Override
    public MyBlogResponseDto getMyBlogPageData(String blogId, String currentLoginId) {
        MyBlogResponseDto response = new MyBlogResponseDto();

        // 프로필 정보
        UserProfileDto profile = this.getUserProfile(blogId);
        response.setUserProfile(profile);
        
        // 유저 PICK 인기글 가져오기
        BlogDTO pickPost = blogMapper.selectPopularPost(blogId);
        response.setPickPost(pickPost);
        
        // 태그 목록 가져오기
        List<TagDto> tags = blogMapper.selectBlogTagList(blogId);
        response.setTags(tags);
        
        // 주인 여부 확인
        boolean isOwner = false;
        if (currentLoginId != null && currentLoginId.equals(blogId)) {
            isOwner = true;
        }
        response.setOwner(isOwner);

        // 통계 데이터 0으로 초기화
        response.setFollowerCount(0);
        response.setFollowingCount(0);
        response.setSubscriberCount(0);
        response.setTotalVisit(0);
        response.setPostCount(0);
        response.setTodayVisit(0);

        return response;
    }
    
    // 블로그 상세 게시글 조회
    @Override
    public BlogDTO getBoardDetail(Long boardNo) {
        // 1. 조회수 증가
        blogMapper.updateViewCount(boardNo);
        
        // 2. 게시글 상세 내용 가져오기
        BlogDTO dto = blogMapper.selectBlogDetail(boardNo);
        
        // 3. 태그 목록 가져와서 넣기 (게시글이 존재할 때만)
        if (dto != null) {
            List<String> tags = blogMapper.selectBoardTags(boardNo);
            dto.setTagList(tags);
        }
        
        return dto;
    }
}