import { computed, onMounted, onUpdated, onUnmounted } from 'vue';
import { useData } from 'vitepress';
import { useAside } from './aside.js';
import { throttleAndDebounce } from '../support/utils.js';
// magic number to avoid repeated retrieval
const PAGE_OFFSET = 56;
export function useOutline() {
    const { page } = useData();
    const hasOutline = computed(() => {
        return page.value.headers.length > 0;
    });
    return {
        hasOutline
    };
}
export function useActiveAnchor(container, marker) {
    const { isAsideEnabled } = useAside();
    const onScroll = throttleAndDebounce(setActiveLink, 100);
    let prevActiveLink = null;
    onMounted(() => {
        requestAnimationFrame(setActiveLink);
        window.addEventListener('scroll', onScroll);
    });
    onUpdated(() => {
        // sidebar update means a route change
        activateLink(location.hash);
    });
    onUnmounted(() => {
        window.removeEventListener('scroll', onScroll);
    });
    function setActiveLink() {
        if (!isAsideEnabled.value) {
            return;
        }
        const links = [].slice.call(container.value.querySelectorAll('.outline-link'));
        const anchors = [].slice
            .call(document.querySelectorAll('.content .header-anchor'))
            .filter((anchor) => {
            return links.some((link) => {
                return link.hash === anchor.hash && anchor.offsetParent !== null;
            });
        });
        const scrollY = window.scrollY;
        const innerHeight = window.innerHeight;
        const offsetHeight = document.body.offsetHeight;
        const isBottom = Math.abs(scrollY + innerHeight - offsetHeight) < 1;
        // page bottom - highlight last one
        if (anchors.length && isBottom) {
            activateLink(anchors[anchors.length - 1].hash);
            return;
        }
        for (let i = 0; i < anchors.length; i++) {
            const anchor = anchors[i];
            const nextAnchor = anchors[i + 1];
            const [isActive, hash] = isAnchorActive(i, anchor, nextAnchor);
            if (isActive) {
                activateLink(hash);
                return;
            }
        }
    }
    function activateLink(hash) {
        if (prevActiveLink) {
            prevActiveLink.classList.remove('active');
        }
        if (hash !== null) {
            prevActiveLink = container.value.querySelector(`a[href="${decodeURIComponent(hash)}"]`);
        }
        const activeLink = prevActiveLink;
        if (activeLink) {
            activeLink.classList.add('active');
            marker.value.style.top = activeLink.offsetTop + 33 + 'px';
            marker.value.style.opacity = '1';
        }
        else {
            marker.value.style.top = '33px';
            marker.value.style.opacity = '0';
        }
    }
}
function getAnchorTop(anchor) {
    return anchor.parentElement.offsetTop - PAGE_OFFSET - 15;
}
function isAnchorActive(index, anchor, nextAnchor) {
    const scrollTop = window.scrollY;
    if (index === 0 && scrollTop === 0) {
        return [true, null];
    }
    if (scrollTop < getAnchorTop(anchor)) {
        return [false, null];
    }
    if (!nextAnchor || scrollTop < getAnchorTop(nextAnchor)) {
        return [true, anchor.hash];
    }
    return [false, null];
}
