// Questionnaire functionality

/**
 * 初始化问卷功能
 */
export function initQuestionnaire() {
    // 问卷选项选择
    document.querySelectorAll('.radio-label').forEach(label => {
        label.addEventListener('click', function() {
            // 移除同一组中其他选项的选中状态
            const groupName = this.querySelector('input').getAttribute('name');
            document.querySelectorAll(`.radio-label input[name="${groupName}"]`).forEach(input => {
                input.parentElement.classList.remove('selected');
            });
            
            // 添加当前选项的选中状态
            this.classList.add('selected');
        });
    });
}
