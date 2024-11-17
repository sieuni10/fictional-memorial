document.addEventListener('DOMContentLoaded', function () {
    // 모달 관련 코드
    const modal = document.getElementById('characterModal');
    const modalName = document.getElementById('modalCharacterName');
    const modalDeathType = document.getElementById('modaldeathType');
    const modalDeathReason = document.getElementById('modaldeathReason');
    const modalWorkName = document.getElementById('modalWorkName');
    const modalReleaseDate = document.getElementById('modalReleaseDate');
    const modalComments = document.getElementById('modalComments');
    const modalLikes = document.getElementById('modalLikes');
    const modalImage = document.getElementById('modalCharacterImage'); // 모달 내부 이미지 요소
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const addCommentButton = document.getElementById('addCommentButton');
    const likeButton = document.getElementById('likeButton');
    const toggleBlurButton = document.getElementById('toggleBlurButton');
    let currentCharacter = null;
    const likeStorage = new Set();
    const printButton = document.getElementById('printButton');

    // 블러 처리
    toggleBlurButton.addEventListener('click', function () {
        if (modalDeathReason.classList.contains('blur')) {
            modalDeathReason.classList.remove('blur');
            toggleBlurButton.textContent = '눌러서 가리기';
        } else {
            modalDeathReason.classList.add('blur');
            toggleBlurButton.textContent = '눌러서 확인하기';
        }
    });

    // 캐릭터 클릭 시 모달 열기
    document.querySelectorAll('.character').forEach(character => {
        character.addEventListener('click', function () {
            currentCharacter = this;
            const characterData = JSON.parse(this.getAttribute('data-modal-content'));

            // 모달에 캐릭터 데이터 설정
            modalName.textContent = characterData.characterName;
            modalDeathType.textContent = characterData.deathType;
            modalDeathReason.textContent = characterData.deathReason;
            modalWorkName.textContent = characterData.workName;
            modalReleaseDate.textContent = characterData.releaseDate;
            modalLikes.textContent = characterData.likes;

            // 모달 이미지 변경
            modalImage.src = characterData.image; // 캐릭터의 이미지 경로로 변경
            modalImage.alt = characterData.characterName; // 이미지 설명 변경

            // 댓글 렌더링
            renderComments(characterData.comments);

            // 스크롤바 너비만큼 패딩 추가
            // const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            // document.body.style.paddingRight = `${scrollbarWidth}px`;

            // 모달 열기
            modal.style.display = 'block'; // 모달을 먼저 보여주고
            setTimeout(() => {
                modal.classList.add('show'); // 애니메이션 클래스를 추가
                document.querySelector('.modal-backdrop').classList.add('show'); // 백드롭 보이기
            }, 10);
            // 프린트 버튼 보여주기
            printButton.classList.remove('hidden');
            printButton.classList.add('show');
        });
    });

    // 모달 닫는 함수
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
            document.body.style.paddingRight = ''; // 추가했던 패딩을 제거
        }, 300); // 애니메이션 시간과 맞춤

        // 프린트 버튼 숨기기
        printButton.classList.remove('show');
        // printButton.classList.add('hidden');
    }

    // 모달 닫기 버튼에 이벤트 연결
    closeModalBtn.addEventListener('click', closeModal);

    // 프린트 버튼 클릭 시 프린트 내용 구성
    printButton.addEventListener('click', function () {
        const characterName = document.getElementById('modalCharacterName').innerText;
        const deathType = document.getElementById('modaldeathType').innerText;
        const workName = document.getElementById('modalWorkName').innerText;
        const releaseDate = document.getElementById('modalReleaseDate').innerText;
        const deathReason = document.getElementById('modaldeathReason').innerText;

        const modalImage = document.getElementById('modalCharacterImage');
        const imgSrc = modalImage.alt;
        console.log(imgSrc);
        // const printContent = `
        //     캐릭터 이름: ${characterName}
        //     사망 유형: ${deathType}
        //     작품명: ${workName}
        //     공개일: ${releaseDate}
        //     사망 이유: ${deathReason}
        // `;

        const newWindow = window.open('receipt/receipt.html', '_blank', 'width=400,height=600');
        newWindow.onload = function(){
            const nameElement = newWindow.document.getElementById('name');
            const typeElement = newWindow.document.getElementById('type');
            const dateElement = newWindow.document.getElementById('date');
            const reasonElement = newWindow.document.getElementById('reason');
            const receiptImage = newWindow.document.getElementById('test');


            nameElement.innerText = characterName;
            typeElement.innerText = deathType;
            dateElement.innerText = releaseDate;
            reasonElement.innerText = deathReason;
            receiptImage.src = "receipt-image/"+imgSrc+".png";
        }
        //newWindow.document.write(`<pre>${printContent}</pre>`);
        newWindow.document.close();
        newWindow.print();
    });

    // 댓글 추가
    addCommentButton.addEventListener('click', function () {
        if (!currentCharacter) return;

        const commenterName = document.getElementById('commenterName').value;
        const commentContent = document.getElementById('commentContent').value;

        if (commenterName && commentContent) {
            const characterData = JSON.parse(currentCharacter.getAttribute('data-modal-content'));

            const currentDate = new Date();
            const dateString = currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
            const timeString = currentDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });
            const dateTime = `${dateString}, ${timeString}`;

            characterData.comments.push({ name: commenterName, content: commentContent, date: dateTime });
            currentCharacter.setAttribute('data-modal-content', JSON.stringify(characterData));

            renderComments(characterData.comments);

            document.getElementById('commenterName').value = '';
            document.getElementById('commentContent').value = '';
        }
    });

    // 댓글 렌더링
    function renderComments(comments) {
        modalComments.innerHTML = comments.map(comment => `
            <div class="comment">
                <p class="comment-name">${comment.name}</p>
                <p class="comment-date">${comment.date}</p>
                <p class="comment-content">${comment.content}</p>
            </div>
        `).join('');
    }

    // 좋아요 기능
    likeButton.addEventListener('click', function () {
        if (!currentCharacter) return;

        const characterData = JSON.parse(currentCharacter.getAttribute('data-modal-content'));
        const characterId = currentCharacter.getAttribute('id');

        if (!likeStorage.has(characterId)) {
            characterData.likes += 1;
            likeStorage.add(characterId);
        } else {
            characterData.likes -= 1;
            likeStorage.delete(characterId);
        }

        currentCharacter.setAttribute('data-modal-content', JSON.stringify(characterData));
        modalLikes.textContent = characterData.likes;
    });

    // 필터링 기능 및 active 클래스 추가
    const filterButtons = document.querySelectorAll('.filter-button');

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const filter = this.getAttribute('data-filter');

            // 모든 버튼에서 active 클래스 제거
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            // 클릭된 버튼에 active 클래스 추가
            this.classList.add('active');

            // 캐릭터 필터링
            document.querySelectorAll('.character').forEach(character => {
                const characterFilter = character.getAttribute('data-filter');
                if (filter === 'all' || characterFilter === filter) {
                    character.style.display = 'inline'; // 해당 조건에 맞는 캐릭터 표시
                } else {
                    character.style.display = 'none'; // 조건에 맞지 않는 캐릭터 숨기기
                }
            });
        });
    });
});
