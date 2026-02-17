import requests
import json
import time
import os
import random

# === 1. 配置区 ===
# 已经填入你提供的最新凭证
COOKIE = """gr_user_id=289c0c34-67da-41bd-9212-0c5a68208814; 87b5a3c3f1a55520_gr_last_sent_cs1=Capsfly; __stripe_mid=feac5cc8-27b6-4c7f-8fcc-d69712e25ace0c0682; FCNEC=%5B%5B%22AKsRol_YMihXy5zyV7IDW2EcEGxvEgdTdbf35p8j5wbrzMYXBX7qsBP7xErr5B23mePUh67T3EWc5aIVQ54LS5RVyCPCFDh6H42pnX29sRO1DFzJ47tfvq_pHE0huytoPp7GztsncLbiS_lPMiyn0Lv_2Qw3hoLFwQ%3D%3D%22%5D%5D; FCCDCF=%5Bnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5B32%2C%22%5B%5C%22a45a892d-4403-4246-8ced-b1cb6e40e057%5C%22%2C%5B1762461987%2C679000000%5D%5D%22%5D%5D%5D; __gads=ID=72b3a8d965d367b6:T=1758751733:RT=1762800177:S=ALNI_MbuNnCM4e67ZnmnIuhiDrGaa8LcBw; __gpi=UID=00001152ce1cc3c2:T=1758751733:RT=1762800177:S=ALNI_Ma-nWpm1hyGtYz9dJaQvKWaFkVjcA; __eoi=ID=a3767decbbb18fc7:T=1758751733:RT=1762800177:S=AA-AfjaYNCLsAZMao791Klg6yyIQ; _ga_CDRWKZTDEX=deleted; _ga=GA1.1.728054218.1758751722; cf_clearance=pf_05whzj3.PIQgLbeFpMry7gJZgpWp2HEQks45SItQ-1770956075-1.2.1.1-cOHPiQoX49hVmBgwas6imztyLwL_PdFww6OdugtMVq7Zp9m.IlaOTaph_PhTqVkZs9coBIBdN8dYNWBKe.39_youCsFXGrtaWvb_Is2wc8Mf5MqL7wRk.0TjfydO832VmbrPVzetom558Cyiu88WcClDA5axS8yM1YW0W_tYifN2oQmTcEuyf.PJqSu4Windmw8fcxOqzJ3Xm.uM1EPbs.aC_87dScVCIO8quTet1zk; csrftoken=OcFSADiw7zDPIcw9gBPp7Hssop4PndG5; LEETCODE_SESSION=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfYXV0aF91c2VyX2lkIjoiODkxNDYyNSIsIl9hdXRoX3VzZXJfYmFja2VuZCI6ImFsbGF1dGguYWNjb3VudC5hdXRoX2JhY2tlbmRzLkF1dGhlbnRpY2F0aW9uQmFja2VuZCIsIl9hdXRoX3VzZXJfaGFzaCI6IjIyZTBkMWNhYzBlNDY4Y2ViZGRiNzg4ZTJjMjNhMDZjOWFhODAyMTQ2ZDIzMzhjNTQzZWNkNzA3ODQwOTUxNTUiLCJzZXNzaW9uX3V1aWQiOiI0MWQ2MzFmMCIsImlkIjo4OTE0NjI1LCJlbWFpbCI6IjIwMTg2NDA4MDBAcXEuY29tIiwidXNlcm5hbWUiOiJDYXBzZmx5IiwidXNlcl9zbHVnIjoiQ2Fwc2ZseSIsImF2YXRhciI6Imh0dHBzOi8vYXNzZXRzLmxlZXRjb2RlLmNvbS91c2Vycy9hdmF0YXJzL2F2YXRhcl8xNjc3NzQzOTc5LnBuZyIsInJlZnJlc2hlZF9hdCI6MTc3MTIwMzIwNiwiaXAiOiI2OS4xMTQuMTcwLjE2MSIsImlkZW50aXR5IjoiMzZiZTM1YzhkNjYzYTczOTM0Y2RmMjQwNDQxMmZhOWIiLCJkZXZpY2Vfd2l0aF9pcCI6WyI5MjdiZjQ0NWQzODQzZjgyY2FjZDAxMDAzOTQ3NjY3ZCIsIjY5LjExNC4xNzAuMTYxIl19.2enlmq9KfXgCo-Xmhwl93f8rJluytxNpLGzz93-inVw; INGRESSCOOKIE=708c4d2267923035c18b302b61df8ce3|8e0876c7c1464cc0ac96bc2edceabd27; i18next=zh-CN; ip_check=(false, "69.114.170.161"); 87b5a3c3f1a55520_gr_session_id=b4b3d4b7-80b2-47e6-ab07-702ac62fb43f; 87b5a3c3f1a55520_gr_last_sent_sid_with_cs1=b4b3d4b7-80b2-47e6-ab07-702ac62fb43f; 87b5a3c3f1a55520_gr_session_id_sent_vst=b4b3d4b7-80b2-47e6-ab07-702ac62fb43f; __stripe_sid=a5deaa8e-b964-4398-9164-daac5c367696cc9d7b; 87b5a3c3f1a55520_gr_cs1=Capsfly; _ga_CDRWKZTDEX=GS2.1.s1771203210$o56$g1$t1771203419$j53$l0$h0"""
CSRF_TOKEN = "OcFSADiw7zDPIcw9gBPp7Hssop4PndG5"
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36"

URL = "https://leetcode.com/graphql"
SAVE_DIR = "leetcode_data"

# 确保保存目录存在
if not os.path.exists(SAVE_DIR):
    os.makedirs(SAVE_DIR)

HEADERS = {
    "content-type": "application/json",
    "origin": "https://leetcode.com",
    "referer": "https://leetcode.com/problemset/all/",
    "user-agent": USER_AGENT,
    "x-csrftoken": CSRF_TOKEN,
    "cookie": COOKIE
}

# 增加 metaData 抓取，这对你后续做判题机至关重要
QUERY = """
query getQuestionDetails($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    questionFrontendId
    title
    titleSlug
    content
    difficulty
    codeSnippets {
      lang
      code
    }
    stats
    metaData
    sampleTestCase
  }
}
"""

def scrape_problems():
    # 1. 检查任务清单是否存在
    if not os.path.exists("task_list.json"):
        print("错误：未找到 task_list.json。请先运行获取清单的脚本。")
        return

    with open("task_list.json", "r") as f:
        slugs = json.load(f)

    print(f"开始爬取，总计 {len(slugs)} 道题目...")

    for i, slug in enumerate(slugs):
        file_path = os.path.join(SAVE_DIR, f"{slug}.json")

        # 2. 断点续传逻辑
        if os.path.exists(file_path):
            print(f"跳过: {slug}")
            continue

        print(f"[{i+1}/{len(slugs)}] 正在拉取: {slug}...")

        payload = {
            "query": QUERY,
            "variables": {"titleSlug": slug}
        }

        try:
            # 增加超时控制
            response = requests.post(URL, json=payload, headers=HEADERS, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if "data" in data and data["data"]["question"]:
                    # 3. 保存至本地
                    with open(file_path, "w", encoding="utf-8") as f:
                        json.dump(data["data"]["question"], f, ensure_ascii=False, indent=2)
                    
                    
                    wait_time = random.randint(10, 15)
                    print(f"   - 成功保存。进入冷却，休眠 {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    print(f"   - 警告: 数据结构异常 {slug}")
            elif response.status_code == 429:
                print("！！！被限流 (429)")
                break
            else:
                print(f"   - 错误: 状态码 {response.status_code}")
                # 遇到非429错误，歇30秒重试下一条
                time.sleep(30)

        except Exception as e:
            print(f"   - 异常: {e}")
            time.sleep(30)

if __name__ == "__main__":
    scrape_problems()