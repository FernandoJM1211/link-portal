<template>
  <component :is="resolvedIcon" :class="className" :size="size" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Globe,
  FileText,
  MessageCircle,
  Download,
  Calendar,
  HelpCircle,
  Video,
  BookOpen,
  Link as LinkIcon,
  Phone,
  Mail,
  MapPin,
  Star,
  Share2,
  ExternalLink,
  Instagram,
  Youtube
} from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    name?: string
    size?: number | string
    className?: string
  }>(),
  {
    name: 'Globe',
    size: 20,
    className: ''
  }
)

const iconMap: Record<string, any> = {
  Globe,
  FileText,
  MessageCircle,
  Download,
  Calendar,
  HelpCircle,
  Video,
  BookOpen,
  Link: LinkIcon,
  Phone,
  Mail,
  MapPin,
  Star,
  Share2,
  ExternalLink,
  Instagram,
  Youtube
}

const resolvedIcon = computed(() => {
  if (props.name && iconMap[props.name]) {
    return iconMap[props.name]
  }
  return LinkIcon
})
</script>
