import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import re

# 드라이버 실행
driver = uc.Chrome()

try:
    driver.get('https://www.jobkorea.co.kr/Theme/it_developer')
    wait = WebDriverWait(driver, 20)
    
    # 1. 오늘 등록 필터 클릭
    today_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "label[for='rlistTab27']")))
    today_btn.click()
    time.sleep(5)

    # 2. 공고 링크 수집
    job_elements = driver.find_elements(By.XPATH, "//tr[descendant::div[@class='titBx']]")
    temp_list = []
    for row in job_elements:
        try:
            title_tag = row.find_element(By.CSS_SELECTOR, ".titBx strong a")
            temp_list.append({
                'COMPANY_NAME': row.find_element(By.CSS_SELECTOR, ".tplCo a").text.strip(),
                'POSTING_TITLE': title_tag.text.strip(),
                'APPLY_METHOD': title_tag.get_attribute('href') # 접수방법은 해당 URL로 대체
            })
        except: continue

    final_db_data = []

    # 3. 상세 페이지 순회 및 DB 컬럼 매핑
    for i, job in enumerate(temp_list, 1):
        print(f"[{i}/{len(temp_list)}] {job['COMPANY_NAME']} 상세 수집 중...")
        driver.get(job['APPLY_METHOD'])
        time.sleep(4)

        if driver.find_elements(By.ID, "gib_frame"):
            driver.switch_to.frame("gib_frame")

        full_text = driver.find_element(By.TAG_NAME, "body").text
        
        # 날짜 추출 (시작일/마감일)
        dates = re.findall(r'\d{4}\.\d{2}\.\d{2}', full_text)
        apply_start = dates[0] if len(dates) >= 1 else time.strftime('%Y.%m.%d')
        apply_end = dates[1] if len(dates) >= 2 else "채용시 마감"

        # 텍스트 추출 보조 함수
        def get_val(key, default="정보없음"):
            if key in full_text:
                try:
                    return full_text.split(key)[1].split('\n')[1].strip()
                except: return default
            return default

        # DB 테이블 구조 매핑 (JOB_POSTING & COMPANY_CODE 통합본)
        record = {
            # JOB_POSTING 테이블 컬럼
            'POSTING_TITLE': job['POSTING_TITLE'],
            'POSTING_CONTENT': "상세내용 URL 참조", # CLOB용
            'REC_FIELD': get_val("모집요강"),
            'REC_COUNT': get_val("모집인원"),
            'EMP_TYPE': get_val("고용형태"),
            'SALARY': get_val("급여"),
            'REQ_CAREER': get_val("경력"),
            'REQ_EDUCATION': get_val("학력"),
            'APPLY_START': apply_start,
            'APPLY_END': apply_end,
            'APPLY_METHOD': "홈페이지 접수(잡코리아)",
            
            # COMPANY_CODE 테이블 컬럼
            'COMPANY_NAME': job['COMPANY_NAME'],
            'WORK_ADDR': get_val("근무지주소") if "근무지주소" in full_text else get_val("지역"),
            'NEARBY_SUB': get_val("인근지하철")
        }
        
        final_db_data.append(record)
        driver.switch_to.default_content()

    # 4. 결과 출력
    print("\n" + "="*20 + " DB INSERT용 데이터셋 " + "="*20)
    for data in final_db_data:
        print(f"회사: {data['COMPANY_NAME']}")
        print(f"회사주소: {data['WORK_ADDR']}")
        print(f"인근지하철: {data['NEARBY_SUB']}")
        print(f"공고제목: {data['POSTING_TITLE']}")
        print(f"모집요강: {data['REC_FIELD']}")
        print(f"모집인원: {data['REC_COUNT']}")
        print(f"고용형태: {data['EMP_TYPE']}")
        print(f"급여: {data['SALARY']}")
        print(f"경력: {data['REQ_CAREER']}")
        print(f"학력: {data['REQ_EDUCATION']}")
        print(f"접수시작일: {data['APPLY_START']}")
        print(f"접수마감일: {data['APPLY_END']}")
        print(f"접수방법: {data['APPLY_METHOD']}")
        print("-" * 50)

except Exception as e:
    print(f"오류: {e}")
finally:
    driver.quit()