import { motion } from "framer-motion";
import { Image, Sparkles, Link2, Users } from "lucide-react";

export function PosterAnimation() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:flex-row md:gap-8">
      {/* Poster */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="flex h-32 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 p-3">
          <Image className="h-8 w-8 text-primary/60" />
          <span className="mt-2 text-xs font-medium text-primary/60">Poster</span>
        </div>
        <motion.div
          animate={{ 
            y: [0, -3, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -right-2 -top-2"
        >
          <div className="rounded-full bg-primary/20 p-1">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
        </motion.div>
      </motion.div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="hidden h-0.5 w-12 bg-gradient-to-r from-primary/40 to-primary md:block"
      />
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="h-8 w-0.5 bg-gradient-to-b from-primary/40 to-primary md:hidden"
      />

      {/* Link */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex h-32 w-24 flex-col items-center justify-center rounded-lg border border-border bg-card p-3 shadow-lg"
      >
        <Link2 className="h-8 w-8 text-primary" />
        <span className="mt-2 text-xs font-medium text-foreground">Event Link</span>
      </motion.div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="hidden h-0.5 w-12 bg-gradient-to-r from-primary to-primary/40 md:block"
      />
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="h-8 w-0.5 bg-gradient-to-b from-primary to-primary/40 md:hidden"
      />

      {/* Community */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="flex h-32 w-24 flex-col items-center justify-center rounded-lg border border-primary bg-gradient-to-br from-primary/20 to-primary/10 p-3"
      >
        <Users className="h-8 w-8 text-primary" />
        <span className="mt-2 text-xs font-medium text-primary">Community</span>
      </motion.div>
    </div>
  );
}
