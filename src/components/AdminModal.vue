<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useAdmin } from '../composables/useAdmin'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
const { tryUnlock } = useAdmin()

const inputRef = ref<HTMLInputElement | null>(null)
const value = ref('')
const err = ref('')

watch(
  () => props.open,
  (v) => {
    if (v) {
      err.value = ''
      value.value = ''
      nextTick(() => inputRef.value?.focus())
    }
  },
)

async function submit() {
  const phrase = value.value.trim()
  if (!phrase) return
  err.value = ''
  const ok = await tryUnlock(phrase)
  if (!ok) {
    err.value = 'รหัสผ่านไม่ถูกต้อง'
    inputRef.value?.select()
    return
  }
  emit('close')
}

function onScrimClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-scrim" :class="{ open }" @click="onScrimClick">
      <div class="modal">
        <h3>เข้าสู่โหมดแอดมิน</h3>
        <p>กรอกรหัสผ่านเพื่อดูค่าใช้จ่าย LLM, สรุปผู้ใช้งาน, และสถิติรายวัน</p>
        <input
          ref="inputRef"
          v-model="value"
          type="password"
          placeholder="passphrase"
          autocomplete="current-password"
          @keydown.enter="submit"
        />
        <div class="err">{{ err }}</div>
        <div class="actions">
          <button @click="emit('close')">ยกเลิก</button>
          <button class="primary" @click="submit">เข้าสู่ระบบ</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
.modal-scrim {
  position: fixed;
  inset: 0;
  background: rgba(20, 16, 8, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--t-med);
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 20px;
}
:root[data-theme='dark'] .modal-scrim {
  background: rgba(8, 10, 14, 0.7);
}
.modal-scrim.open {
  opacity: 1;
  pointer-events: auto;
}
.modal {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 28px 30px;
  max-width: 380px;
  width: 100%;
  box-shadow: var(--shadow-deep);
  transform: translateY(8px) scale(0.98);
  transition: transform var(--t-med);
}
.modal-scrim.open .modal {
  transform: translateY(0) scale(1);
}
.modal h3 {
  font-family: 'Noto Serif Thai', serif;
  font-weight: 700;
  font-size: 19px;
  margin-bottom: 6px;
  color: var(--ink-1);
}
.modal p {
  font-family: 'Noto Sans Thai', sans-serif;
  font-size: 13px;
  color: var(--ink-3);
  margin-bottom: 18px;
}
.modal input {
  width: 100%;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--ink-1);
  padding: 11px 14px;
  font: inherit;
  font-size: 15px;
  border-radius: 10px;
  outline: none;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.04em;
  transition: border var(--t-fast);
}
.modal input:focus {
  border-color: var(--gold);
}
.modal .actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  justify-content: flex-end;
}
.modal button {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  padding: 9px 16px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--ink-2);
  transition: all var(--t-fast);
}
.modal button:hover {
  background: var(--surface-3);
}
.modal button.primary {
  background: var(--ink-1);
  color: var(--surface);
  border-color: var(--ink-1);
}
.modal button.primary:hover {
  background: var(--gold);
  border-color: var(--gold);
}
.modal .err {
  color: var(--coral);
  font-size: 12.5px;
  margin-top: 10px;
  font-family: 'Noto Sans Thai', sans-serif;
  min-height: 1em;
}

@media (max-width: 640px) {
  .modal {
    padding: 24px 22px;
    border-radius: 14px;
  }
  .modal h3 {
    font-size: 17px;
  }
  .modal input {
    font-size: 16px;
  }
  .modal .actions {
    flex-direction: column-reverse;
  }
  .modal button {
    padding: 12px 16px;
    text-align: center;
    width: 100%;
  }
}
</style>
