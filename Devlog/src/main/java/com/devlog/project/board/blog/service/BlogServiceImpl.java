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
import com.devlog.project.board.blog.dto.MyBlogResponseDto;
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

    // 1. 블로그 목록 조회
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

    // 2. 글 작성
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

    // 3. 내 블로그 목록 조회
    @Override
    public Map<String, Object> getMyBlogList(String blogId, String type, int page, int size, String sort) {
        Map<String, Object> params = new HashMap<>();
        params.put("blogId", blogId);
        params.put("type", type);
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

    // 4. 이미지 업로드
    @Override
    public String uploadImage(MultipartFile image) {
        if (image == null || image.isEmpty()) return null;

        String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
        File folder = new File(uploadLocation);
        if (!folder.exists()) folder.mkdirs();

        try {
            File saveFile = new File(uploadLocation, fileName);
            image.transferTo(saveFile);
            return uploadWebPath + fileName;
        } catch (IOException e) {
            throw new RuntimeException("이미지 업로드 실패", e);
        }
    }

    // 5. 프로필 조회
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

    // 6. 상세 조회
    @Override
    public BlogDTO getBoardDetail(Long boardNo) {
        blogMapper.updateViewCount(boardNo);
        BlogDTO dto = blogMapper.selectBlogDetail(boardNo);
        if (dto != null) {
            List<String> tags = blogMapper.selectBoardTags(boardNo);
            dto.setTagList(tags);
        }
        return dto;
    }

    // 7. 팔로우 여부 확인
    @Override
    public boolean isFollowing(Long followerId, Long targetId) {
        Map<String, Object> params = new HashMap<>();
        params.put("followerId", followerId);
        params.put("targetId", targetId);
        return blogMapper.checkFollowStatus(params) > 0;
    }

    // 8. 팔로우 토글
    @Override
    @Transactional
    public boolean toggleFollow(Long followerId, Long targetId) {
        Map<String, Object> params = new HashMap<>();
        params.put("followerId", followerId);
        params.put("targetId", targetId);

        int count = blogMapper.checkFollowStatus(params);
        if (count > 0) {
            blogMapper.deleteFollow(params);
            return false; // 언팔로우됨
        } else {
            blogMapper.insertFollow(params);
            return true; // 팔로우됨
        }
    }

    // 9. 방문자 수 증가
    @Override
    @Transactional
    public void increaseVisitCount(Long blogOwnerNo) {
        Map<String, Object> visitData = blogMapper.selectVisitCount(blogOwnerNo);
        if (visitData == null) {
            blogMapper.insertVisitCount(blogOwnerNo);
        } else {
            blogMapper.updateVisitCount(blogOwnerNo);
        }
    }

    // 10. [핵심] 화면용 전체 데이터 (통계 포함) - 중복 제거됨
    @Override
    public MyBlogResponseDto getMyBlogPageData(String blogId, String currentLoginId) {
        MyBlogResponseDto response = new MyBlogResponseDto();

        // 1) 프로필
        UserProfileDto profile = this.getUserProfile(blogId);
        response.setUserProfile(profile);

        // 2) 주인 찾기
        Member blogOwner = memberRepository.findByMemberEmailAndMemberDelFl(blogId, CommonEnums.Status.N).orElse(null);
        Long ownerNo = (blogOwner != null) ? blogOwner.getMemberNo() : 0L;

        // 3) 주인 여부 체크
        boolean isOwner = false;
        if (currentLoginId != null && currentLoginId.equals(blogId)) {
            isOwner = true;
        }
        response.setOwner(isOwner);

        // 4) 인기글, 태그
        response.setPickPost(blogMapper.selectPopularPost(blogId));
        response.setTags(blogMapper.selectBlogTagList(blogId));

        // 5) 통계 데이터 (DB 조회)
        if (ownerNo != 0L) {
            response.setFollowerCount(blogMapper.countFollower(ownerNo));
            response.setFollowingCount(blogMapper.countFollowing(ownerNo));

            // 방문자 수
            Map<String, Object> visitMap = blogMapper.selectVisitCount(ownerNo);
            if (visitMap != null) {
                // 오라클 숫자는 BigDecimal로 올 수 있어서 String 변환 후 파싱이 안전
                response.setTotalVisit(Integer.parseInt(String.valueOf(visitMap.get("TOTAL_VISIT"))));
                response.setTodayVisit(Integer.parseInt(String.valueOf(visitMap.get("DAILY_VISIT"))));
            } else {
                response.setTotalVisit(0);
                response.setTodayVisit(0);
            }
        }

        response.setPostCount(blogMapper.countTotalPosts(blogId));
        response.setSubscriberCount(0);

        return response;
    }
    
    // 팔로워/팔로잉 목록 가져오기
    @Override
    public List<UserProfileDto> getFollowList(String blogId, String type) {
        Member owner = memberRepository.findByMemberEmailAndMemberDelFl(blogId, CommonEnums.Status.N)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));
        
        if ("follower".equals(type)) {
            return blogMapper.selectFollowerList(owner.getMemberNo());
        } else {
            return blogMapper.selectFollowingList(owner.getMemberNo());
        }
    }
}