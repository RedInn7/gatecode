import mysql.connector
import json
import os

def import_leetcode_data():
    config = {
        'user': 'root',
        'password': '',
        'host': '127.0.0.1', # 或者你的云数据库地址
        'database': 'gatecode',
    }

    # 2. 路径配置 (根据你的目录结构)
    data_dir = './fetch_data/leetcode_data'
    
    try:
        cnx = mysql.connector.connect(**config)
        cursor = cnx.cursor()

        # 准备插入语句 (ON DUPLICATE KEY UPDATE 保证幂等性)
        add_problem = ("""
            INSERT INTO problems 
            (frontend_question_id, title, slug, difficulty, content, template_code, test_cases, is_vip_only)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            title=VALUES(title), content=VALUES(content), template_code=VALUES(template_code)
        """)

        count = 0
        # 3. 遍历目录下的所有 JSON 文件
        for filename in os.listdir(data_dir):
            if filename.endswith('.json'):
                file_path = os.path.join(data_dir, filename)
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                    # --- 数据清洗 ---
                    # 转换代码模板为 JSON 对象存储
                    templates = {item['lang']: item['code'] for item in data.get('codeSnippets', [])}
                    
                    # 构造基础测试用例
                    test_cases = [{"input": data.get('sampleTestCase', ""), "output": ""}]
                    
                    # 商业逻辑：Hard 难度自动标为 VIP (#6)
                    is_vip = 1 if data.get('difficulty') == 'Hard' else 0

                    problem_data = (
                        int(data['questionFrontendId']),
                        data['title'],
                        data['titleSlug'],
                        data['difficulty'],
                        data['content'],
                        json.dumps(templates),
                        json.dumps(test_cases),
                        is_vip
                    )

                    try:
                        cursor.execute(add_problem, problem_data)
                        count += 1
                        if count % 50 == 0:
                            print(f"🚀 已成功导入 {count} 道题目...")
                    except Exception as e:
                        print(f"❌ 导入文件 {filename} 失败: {e}")

        cnx.commit()
        print(f"\n✨ 任务全部完成！共导入 {count} 道题目。")

    except mysql.connector.Error as err:
        print(f"数据库连接失败: {err}")
    finally:
        if 'cnx' in locals() and cnx.is_connected():
            cursor.close()
            cnx.close()

if __name__ == "__main__":
    import_leetcode_data()